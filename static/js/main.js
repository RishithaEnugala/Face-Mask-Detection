$(document).ready(function () {
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();
    $('#confidence-bar-container').hide();

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imageUpload").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();

        $('#confidence-bar-container').hide();
        $('#confidence-bar').css('width', '0%').text('0%').removeClass();

        readURL(this);
    });

    $('#btn-predict').click(function () {
        var form_data = new FormData($('#upload-file')[0]);

        $(this).hide();
        $('.loader').show();

        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                $('.loader').hide();
                $('#result').fadeIn(600);

                if (data.includes("not having mask")) {
                    $('#result').html(`<span style="color: red;">Result: ${data}</span>`);
                } else {
                    $('#result').html(`<span style="color: green;">Result: ${data}</span>`);
                }

                let confidenceMatch = data.match(/(\d+(\.\d+)?)%/);
                if (confidenceMatch) {
                    let confidence = parseFloat(confidenceMatch[1]);

                    $('#confidence-bar-container').show();
                    $('#confidence-bar')
                        .css('width', confidence + '%')
                        .attr('aria-valuenow', confidence)
                        .text(confidence.toFixed(2) + '%');

                    if (confidence > 75) {
                        $('#confidence-bar').removeClass().addClass('progress-bar bg-success');
                    } else if (confidence > 50) {
                        $('#confidence-bar').removeClass().addClass('progress-bar bg-warning');
                    } else {
                        $('#confidence-bar').removeClass().addClass('progress-bar bg-danger');
                    }
                }
            },
            error: function () {
                $('.loader').hide();
                $('#result').fadeIn(600).html('<span style="color:red;">Error during prediction. Please try again.</span>');
                $('#btn-predict').show();
            }
        });
    });
});
