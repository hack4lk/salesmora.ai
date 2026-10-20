'use client';

import { useState, useRef, useEffect } from 'react';
import { woButton } from '../work-order-ui';

export interface WorkOrderCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function WorkOrderCameraCapture({ onCapture, onCancel }: WorkOrderCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!cameraActive || previewUrl) return;

    const startCamera = async () => {
      try {
        setError(null);
        setPermissionDenied(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        const error = err as Error;
        if (error.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError('Camera permission denied. Please enable camera access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${error.message}`);
        }
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [cameraActive, previewUrl]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      blob => {
        if (blob) {
          setCapturedBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      },
      'image/jpeg',
      0.8
    );
  };

  const usePhoto = () => {
    if (!capturedBlob) return;

    // Store blob temporarily before cleanup
    const blobToCapture = capturedBlob;
    
    // Clean up camera
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
    
    // Call the parent handler with the blob
    onCapture(blobToCapture);
  };

  const retakePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="grid gap-4">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!cameraActive && !previewUrl && (
        <div className="grid gap-3">
          {!permissionDenied && (
            <button
              type="button"
              className={woButton}
              onClick={() => setCameraActive(true)}
            >
              📷 Start Camera
            </button>
          )}
          <button type="button" className={woButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {cameraActive && !previewUrl && (
        <div className="grid gap-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={woButton}
              onClick={capturePhoto}
            >
              📸 Capture
            </button>
            <button
              type="button"
              className={woButton}
              onClick={stopCamera}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="grid gap-3">
          <img
            src={previewUrl}
            alt="Captured preview"
            className="w-full rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={woButton}
              onClick={usePhoto}
            >
              ✓ Use Photo
            </button>
            <button
              type="button"
              className={woButton}
              onClick={retakePhoto}
            >
              🔄 Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
