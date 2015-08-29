(function () {
    requirejs.config({
        baseUrl: 'lib',
        paths: {
            app: 'app'
        }
    });

    requirejs(['./auto-pilot-launcher', 'jquery'],function(autoPilotLauncher, $){
        $(document).ready(function(){
            $(document).on('click', '#launch-button', function(event){
                autoPilotLauncher.launch();
            })
        })
    });
})();