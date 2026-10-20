# Camera Capture Feature - Prototype Implementation

## Overview
Successfully implemented camera capture functionality for both Jobs and Work Orders. Users can now take photos directly from their device's camera as an alternative to file uploads.

## Files Created

### Job Components
1. **`/apps/web/src/features/jobs/job-camera-capture/job-camera-capture.tsx`**
   - Core camera capture component using browser MediaDevices API
   - Handles camera stream management, photo capture via canvas
   - Supports retake/preview flow
   - Graceful error handling for permission denied and device unavailability
   - JPEG compression with 0.8 quality ratio for optimization

2. **`/apps/web/src/features/jobs/job-camera-capture/job-camera-capture.stories.tsx`**
   - Storybook stories for visual testing
   - Default story showing component in isolation
   - Dialog story showing component within upload dialog context

### Work Order Components
1. **`/apps/web/src/features/work-orders/work-order-camera-capture/work-order-camera-capture.tsx`**
   - Identical camera capture implementation for work orders
   - Same MediaDevices API flow and error handling
   - Consistent styling with work order UI patterns

## Files Modified

### Job File Upload Dialog
**`/apps/web/src/features/jobs/job-files/job-file-upload-dialog.tsx`**
- Added tab navigation between "Upload File" and "Take Photo"
- Integrated CameraCapture component into camera tab
- Auto-converts captured Blob to File with timestamp naming: `photo_${Date.now()}.jpg`
- Seamless transition from camera capture to file upload (caption input)
- Camera support detection (hides tab if getUserMedia not available)
- Maintains existing upload flow after photo capture

### Work Order File Upload Dialog
**`/apps/web/src/features/work-orders/work-order-photos/file-upload-dialog.tsx`**
- Identical tab navigation and camera integration as job file upload
- Uses WorkOrderCameraCapture component
- Same Blob-to-File conversion with timestamp
- Full feature parity with job camera capture

## Technical Implementation

### Browser MediaDevices API
- **Stream Management**: Uses `getUserMedia()` with `facingMode: 'environment'` for rear camera on mobile
- **Capture Flow**: 
  1. Video stream → HTML5 `<video>` element
  2. User clicks capture button
  3. Canvas draws current video frame
  4. Canvas converts to JPEG Blob via `toBlob()`
  5. Blob converted to File object for upload API
- **Resource Cleanup**: All tracks stopped on unmount and camera disabled state

### Photo Processing
- **Format**: JPEG (0.8 quality) - standard mobile optimization
- **Naming**: `photo_${Date.now()}.jpg` - ensures unique names per device/timestamp
- **File Object**: Created from Blob for seamless integration with existing upload hooks

### Permission Handling
- Graceful degradation if camera not available (NotFoundError)
- Clear messaging if user denies permission (NotAllowedError)
- Camera tab hidden if device lacks MediaDevices API
- No fallback UI needed - file upload tab always available

### State Management
- `cameraActive`: Controls camera stream lifecycle
- `previewUrl`: Manages preview image display (ObjectURL)
- `error`: Captures and displays errors
- `permissionDenied`: Tracks if user rejected camera permission
- `tab`: Manages upload vs. camera tab visibility

## User Flow

### Taking a Photo
1. User clicks "Take Photo" tab
2. Clicks "Start Camera" button
3. Browser requests camera permission (only once per origin)
4. User frames shot and clicks "📸 Capture"
5. Preview displays captured image
6. User can either:
   - Click "✓ Use Photo" → switches to upload tab with photo ready
   - Click "🔄 Retake" → returns to live camera view
7. Can add optional caption in upload tab
8. Click "Upload" to submit

### Error Cases
- **No camera**: "No camera found on this device."
- **Permission denied**: "Camera permission denied. Please enable camera access in your browser settings."
- **Other errors**: Generic error message with details
- **Fallback**: File upload tab always available if camera fails

## Testing Checklist

- [ ] Desktop browser camera capture (Chrome/Safari)
- [ ] Mobile browser camera capture (iOS Safari/Android Chrome)
- [ ] Camera permission flow (first time, already allowed)
- [ ] Permission denied recovery (fallback to file upload)
- [ ] Photo preview and retake functionality
- [ ] Caption input with captured photo
- [ ] Upload successful with captured photo
- [ ] Canvas cleanup and memory management
- [ ] Video track stopping on cancel/close
- [ ] File naming consistency across devices

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support (requires HTTPS for getUserMedia)
- Safari: Requires iOS 15+ or macOS 11+
- Gracefully degrades to file upload on unsupported browsers

## Next Steps (Future Enhancements)
1. Add image compression/resizing before upload (reduce file size)
2. Add camera format selection (front/rear camera toggle)
3. Add image rotation/crop UI before upload
4. Add native camera app fallback for older browsers
5. Add progress indicator for video stream startup
6. Add flash/torch control for low-light situations
7. Batch photo capture workflow
8. Add watermark/timestamp overlay option

## Notes
- Camera captures are treated identically to uploaded files in the API
- No backend changes needed - existing file upload infrastructure handles Blob objects
- Component follows project's established patterns for error handling and UI
- Memory leak prevention via proper track cleanup and ObjectURL revocation
