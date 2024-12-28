# A plan for images

- Using cloudinary for image hosting and transformations

## Flow

1. UI for uploading images using file input
2. Read files using FileReader
3. Add images to UI for user feedback
4. Generate a signature on the server using an internal API endpoint
5. Upload image to cloudinary using an XHR request to get progress feedback
6. Update UI with progress
7. Receive deletion request from UI
8. Make signature on server and delete based off public_id

Optional:

7. Use a Server Side Event to listen for eager transformations finishing

## Features

1. Choosing multiple images
2. Drag and drop
3. Show progress such as "pending", a percentage / visual percentage, and "done"
4. A preview of the image
5. Deletion of images
6. Blocking of submission until all images are uploaded
