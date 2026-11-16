import * as THREE from 'three';

export interface VoxelModelData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  voxelSize: number;
  depthScale: number;
}

const sharedCubeGeo = new THREE.BoxGeometry(1, 1, 1);

/**
 * Chuyển đổi ảnh PNG concept thành dữ liệu khối 3D Voxel và dựng bằng InstancedMesh
 * (1 draw call / thực thể -> giữ ổn định 60 FPS).
 */
export function extractVoxelDataFromImage(
  image: HTMLImageElement | HTMLCanvasElement,
  maxGridSize: number,
  targetWorldHeight: number,
  depthScale = 2.4,
  remapDarkToHex?: number
): VoxelModelData | null {
  const srcW = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
  const srcH = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
  if (!srcW || !srcH) return null;

  const scale = Math.min(maxGridSize / srcW, maxGridSize / srcH);
  const gridW = Math.max(4, Math.round(srcW * scale));
  const gridH = Math.max(4, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, gridW, gridH);
  ctx.drawImage(image, 0, 0, gridW, gridH);

  const imgData = ctx.getImageData(0, 0, gridW, gridH).data;
  const voxelSize = targetWorldHeight / gridH;

  const posList: number[] = [];
  const colList: number[] = [];
  const tempColor = new THREE.Color();
  const remapColor = remapDarkToHex !== undefined ? new THREE.Color(remapDarkToHex) : null;

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const idx = (y * gridW + x) * 4;
      const a = imgData[idx + 3];
      if (a < 110) continue;

      const r = imgData[idx] / 255;
      const g = imgData[idx + 1] / 255;
      const b = imgData[idx + 2] / 255;

      // Chuyển từ sRGB sang Linear và tăng nhẹ độ sáng để nổi bật trên nền tối
      tempColor.setRGB(r, g, b, THREE.SRGBColorSpace);
      tempColor.multiplyScalar(1.22);

      // Đổi các pixel quá tối sang màu tím sáng nếu được yêu cầu (ví dụ quái màn 3)
      if (remapColor && r < 0.22 && g < 0.22 && b < 0.28) {
        const boost = 0.75 + (r + g + b) * 1.2;
        tempColor.copy(remapColor).multiplyScalar(Math.min(1.3, boost));
      }

      const wx = (x - gridW / 2 + 0.5) * voxelSize;
      const wy = (gridH / 2 - y - 0.5) * voxelSize;

      posList.push(wx, wy, 0);
      colList.push(tempColor.r, tempColor.g, tempColor.b);
    }
  }

  if (posList.length === 0) return null;

  return {
    positions: new Float32Array(posList),
    colors: new Float32Array(colList),
    count: posList.length / 3,
    voxelSize,
    depthScale,
  };
}

export function createVoxelInstancedMesh(
  data: VoxelModelData,
  transparent = false
): THREE.InstancedMesh {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.05,
    transparent,
    opacity: 1,
  });

  const mesh = new THREE.InstancedMesh(sharedCubeGeo, mat, data.count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < data.count; i++) {
    dummy.position.set(
      data.positions[i * 3],
      data.positions[i * 3 + 1],
      data.positions[i * 3 + 2]
    );
    dummy.scale.set(
      data.voxelSize * 1.05,
      data.voxelSize * 1.05,
      data.voxelSize * data.depthScale
    );
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.setRGB(
      data.colors[i * 3],
      data.colors[i * 3 + 1],
      data.colors[i * 3 + 2]
    );
    mesh.setColorAt(i, color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return mesh;
}

