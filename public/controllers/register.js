
function hideRegistrationErrorLabels () {
    $('#nickname-blank').hide();
    $('#password-blank').hide();
    $('#nickname-err').hide();
}

function register() {
    hideRegistrationErrorLabels();

    var currentUser = $('#nick').val(),
        password = $('#password').val();

    if( !currentUser ) {
        $('#nickname-blank').show();
    } else if ( !password ) {
        $('#password-blank').show();
    } else {
        $.post('/register?username=' + currentUser + '&password=' + password, function (response) {
            if ( response == true ) {
                loadLoginPage();
            } else if ( response === 'Duplicate username' ) {
                $('#nickname-err').show();
            } else {
                console.log(response);
            }
        });
    }
}

function loadLoginPage () {
    $( "#content" ).load( "login" );
}
