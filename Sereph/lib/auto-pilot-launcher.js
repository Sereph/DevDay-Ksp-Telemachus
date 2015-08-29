define(['./vessel','./world'], function (vessel, world) {
    function launch(){
        //setInterval(function(){
        //    vessel.situation.distanceToPeriapsis(function(response){
        //        console.log(response);
        //    });
        //},1000);
    }
    return {
        launch: launch
    };
});