function Event()
{
    this.eventHandlers = new Array();
}

Event.prototype.addHandler = function(callback)
{
    this.eventHandlers.push(callback);
}

Event.prototype.removeHandler = function(callback)
{
    var index = this.eventHandlers.indexOf(callback);
    if (index >= 0)
        this.eventHandlers.splice(index, 1);
}

Event.prototype.raise = function(arg1, arg2, arg3)
{
    for (var i = 0; i < this.eventHandlers.length; i++)
    {
        this.eventHandlers[i](arg1, arg2, arg3);
    }
}

var processPostEvent = new Event();
var fullPostsCompletedEvent = new Event();
var processPostBoxEvent = new Event();
var settingsLoadedEvent = new Event();