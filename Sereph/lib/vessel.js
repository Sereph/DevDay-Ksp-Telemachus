define(['./api'], function (api) {
    function stage(){
        api.command('f.stage');
    }

    return{
        stage:stage
    }
});