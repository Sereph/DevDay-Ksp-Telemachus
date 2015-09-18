(function () {
    requirejs.config({
        baseUrl: 'lib',
        paths: {
            app: 'app'
        }
    });

    requirejs(['./auto-pilot-launcher', 'jquery'], function (autoPilotLauncher, $) {
        $(document).ready(function () {
            $(document).on('click', '#launch-button', function () {
                autoPilotLauncher.launch();
            })
            $(document).on('click', '#stop-button', function () {
                autoPilotLauncher.stop();
            });
            $(document).on('click', '#abort-button', function () {
                autoPilotLauncher.abort();
            });
        })
    });
})();