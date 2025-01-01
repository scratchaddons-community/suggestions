# A plan for images

- Using cloudinary for image hosting and transformations

## Flow

- [x] UI for uploading images using file input
- [x] Read files using FileReader
- [x] Add images to UI for user feedback
- [x] Generate a signature on the server using an internal API endpoint
- [x] Upload image to cloudinary using an XHR request to get progress feedback
- [x] Update UI with progress
- [ ] Check if image is SFW
  - [ ] If not, delete image, show error, take action
- [x] Receive deletion request from UI
- [x] Make signature on server and delete based off public_id
- [x] Add images to database on submit

## TODO

- [ ] Images do not keep their order

## Features

- [x] Choosing multiple images
- [x] Drag and drop
- [x] Show progress such as "pending", a percentage / visual percentage, and "done"
- [x] A preview of the image
- [x] Deletion of images
- [x] Blocking of submission until all images are uploaded
