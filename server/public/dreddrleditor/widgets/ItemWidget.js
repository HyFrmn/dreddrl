require([
     "dojo/_base/declare", "dojo/dom-construct", "dojo/ready",
     "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!/dreddrleditor/widgets/ItemWidget.html"
 ], function(declare, domConstruct, ready, _WidgetBase, _TemplatedMixin, template){
    declare("ItemWidget", [_WidgetBase, _TemplatedMixin], {
         // counter
         _i: 0,

         templateString: template,

    });
});