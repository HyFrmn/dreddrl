/*---------------------
	:: Home 
	-> controller
---------------------*/
var HomeController = {

index: function(req, res) {
        res.send('Hello World!');
    }

};
module.exports = HomeController;