const saveCroppedButton = document.getElementById('save-cropped-image');
const editAvatarButton = document.getElementById('edit-avatar');
const cancelCropButton = document.getElementById('cancel-crop');


// Event listener for image input change
document.getElementById('image-input').addEventListener('change', function(event) {
    const imageInput = event.target;
    const previewImage = document.getElementById('cropper-preview');
    const file = imageInput.files[0];

    if (file) {
        saveCroppedButton.style.display = 'block';
        // Display the selected image in the preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';

            // Destroy existing cropper instance if any
            if (window.cropper) {
                window.cropper.destroy();
            }

            // Initialize Cropper.js on the preview image
            window.cropper = new Cropper(previewImage, {
                aspectRatio: 1, // Adjust as needed, 1 for square
                viewMode: 1,
                autoCropArea: 1,
                movable: true,
                scalable: true,
                zoomable: true,
                rotatable: true,
            });
        };
        reader.readAsDataURL(file);
    } else {
        // If no file is selected, hide the button
        saveCroppedButton.style.display = 'none';
    }
});

editAvatarButton.addEventListener('click', function(event) {
    event.preventDefault();

    const previewImage = document.getElementById('cropper-preview');
    const previewWrapper = document.getElementById('image-preview-wrapper');

    // Get the current background image URL
    const backgroundImage = previewWrapper.style.backgroundImage;
    const imageUrl = backgroundImage.slice(4, -1).replace(/"/g, "");

    // Set the preview image src and display it
    previewImage.src = imageUrl;
    previewImage.style.display = 'block';

    // Initialize Cropper.js on the preview image
    if (window.cropper) {
        window.cropper.destroy();
    }
    window.cropper = new Cropper(previewImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        scalable: true,
        zoomable: true,
        rotatable: true,
    });

    // Show the Save Cropped Image button
    saveCroppedButton.style.display = 'block';
    cancelCropButton.style.display = 'block';
});

cancelCropButton.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Cancel button clicked");

    // Hide the cropper preview
    document.getElementById('cropper-preview').style.display = 'none';

    // Destroy the cropper instance if it exists
    if (window.cropper) {
        window.cropper.destroy();
        window.cropper = null;
    }

    // Hide the Save Cropped Image button
    saveCroppedButton.style.display = 'none';

    // Hide the cancel button
    this.style.display = 'none';

    // Show the original image
    const previewWrapper = document.getElementById('image-preview-wrapper');
    previewWrapper.style.backgroundImage = `url(${originalImageUrl})`;
});

// Event listener for saving the cropped image
document.getElementById('save-cropped-image').addEventListener('click', function(event) {
    event.preventDefault(); 
    console.log("Save button clicked");

    if (window.cropper) {
        // Get the cropped image as a Blob
        window.cropper.getCroppedCanvas().toBlob(function(blob) {
            // Create a new File object
            const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });

            // Create a new FileList containing this file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Set the new FileList as the files property of the file input
            const imageInput = document.getElementById('image-input');
            imageInput.files = dataTransfer.files;

            // Update the background image of the preview wrapper
            const previewWrapper = document.getElementById('image-preview-wrapper');
            previewWrapper.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
            
            // Hide the cropper preview
            document.getElementById('cropper-preview').style.display = 'none';

            // Destroy the cropper instance
            window.cropper.destroy();
            window.cropper = null;
            saveCroppedButton.style.display = 'none';
        }, 'image/jpeg');
    }
});
