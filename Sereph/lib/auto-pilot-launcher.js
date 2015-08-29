define(['./vessel'], function (vessel) {
    function launch(){
        console.log("hi");
        vessel.stage();
    }
    return {
        launch: launch
    };
});