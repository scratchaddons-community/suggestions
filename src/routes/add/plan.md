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
- [ ] Add images to database on submit

Optional:

- [ ] Use a Server Side Event to listen for eager transformations finishing

## Features

- [ ] Choosing multiple images
- [ ] Drag and drop
- [ ] Show progress such as "pending", a percentage / visual percentage, and "done"
- [ ] A preview of the image
- [ ] Deletion of images
- [ ] Blocking of submission until all images are uploaded
