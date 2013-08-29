Cloudinary
==========

Cloudinary is a cloud-based service that offers a solution to a web application's entire image management pipeline.

Easily upload images to the cloud. Automatically perform smart image resizing, cropping and conversion without installing any complex software. Integrate Facebook or Twitter profile image extraction in a snap, in any dimension and style to match your website’s graphics requirements. Images are seamlessly delivered through a fast CDN, and much more.

Cloudinary offers comprehensive APIs and administration capabilities and is easy to integrate with any web application, existing or new.

Cloudinary provides URL and HTTP based APIs that can be easily integrated with any Web development framework.

For Appcelerator Titanium, Cloudinary provides a client-side JavaScript library for simplifying the integration with Titanium supported mobile platforms (Android, iOS, BlackBerry, Tizen) even further.

## Setup

* [Sign up](https://cloudinary.com/users/register/free) for a free Cloudinary account
* [Register, download Titanium SDK, setup Titanium Studio and start a project](http://www.appcelerator.com/developers/)
* [Download](https://github.com/cloudinary/cloudinary_titanium/archive/master.zip) or [clone](https://github.com/cloudinary/cloudinary_titanium.git) this repository
* Copy the `Resources/lib` folder into your project (if you already have one you can merge the content)
* Copy the `cloudinary_config.js.sample` file into `cloudinary_config.js` and edit it to include your Cloudinary cloud name.

## Usage

Cloudinary's general documentation can be found at: http://cloudinary.com/documentation

Loading the module:

    var cloudinary = require('/lib/cloudinary');

Retrieving a cloudinary URL based on your on your configuration and the given options:

    var url = cloudinary.url(public_id, options);

Uploading an image (requires a backend with Cloudinary framework):

    var signed_request = retreive_signed_request_from_backend()
    var file = Ti.Filesystem.getFile('my_file')
    function callback(result) {
        if (result.error) {
            Ti.API.error("Error: " + result.error);
        } else {
            Ti.API.info("Uploaded file with public_id: " + result.public_id);
    }
    cloudinary.uploader.upload(file, callback, signed_request);


Uploading an image with `api_secret` (Not recommended - your API secret might be exposed to users)

    var file = Ti.Filesystem.getFile('my_file')
    function callback(result) {
        if (result.error) {
            Ti.API.error("Error: " + result.error);
        } else {
            Ti.API.info("Uploaded file with public_id: " + result.public_id);
    }
    cloudinary.uploader.upload(file, callback, {api_key: "my_api_key", api_secret: "my_api_secret");

Managing resources:

    cloudinary.uploader.destroy(public_id, callback, options)
    cloudinary.uploader.rename(from_public_id, to_public_id, callback, options)

Manipulating tags:

    cloudinary.uploader.add_tag(tag, public_ids, callback, options)
    cloudinary.uploader.remove_tag(tag, public_ids, callback, options)
    cloudinary.uploader.replace_tag(tag, public_ids, callback, options)

Advanced features (please see [documentation](http://cloudinary.com/documentation/sprite_generation) for usage specifications):

    cloudinary.uploader.explicit(public_id, callback, options)  // Refresh a Facebook/Twitter image
    cloudinary.uploader.text(text, callback, options)           // Generate a text image
    cloudinary.uploader.generate_sprite(tag, callback, options) // Generate a sprite
    cloudinary.uploader.multi(tag, callback, options)           // Create an animated GIF or a multi-page PDF document
    cloudinary.uploader.explode(public_id, callback, options)   // Explode a PDF into multiple separate images

## Additional resources

Additional resources are available at:

* [Website](http://cloudinary.com)
* [Documentation](http://cloudinary.com/documentation)
* [Knowledge Base](http://support.cloudinary.com/forums)
* [Upload API documentation](http://cloudinary.com/documentation/upload_images)
* [Image transformations documentation](http://cloudinary.com/documentation/image_transformations)

## Support

You can [open an issue through GitHub](https://github.com/cloudinary/cloudinary_titanium/issues).

Contact us [http://cloudinary.com/contact](http://cloudinary.com/contact)

Stay tuned for updates, tips and tutorials: [Blog](http://cloudinary.com/blog), [Twitter](https://twitter.com/cloudinary), [Facebook](http://www.facebook.com/Cloudinary).


## License #######################################################################

Released under the MIT license.
