define(['./vessel'], function (vessel) {
    function launch(){
        vessel.stage();
    }
    return {
        launch: launch
    };
});