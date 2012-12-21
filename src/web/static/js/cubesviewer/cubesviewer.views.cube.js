/*
 * CubesViewer
 * Copyright (c) 2012-2013 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * If your version of the Software supports interaction with it remotely through
 * a computer network, the above copyright notice and this permission notice
 * shall be accessible to all users.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Cube view. 
 */
function cubesviewerViewCube () {

	this.cubesviewer = cubesviewer;

	this.onViewCreate = function(event, view) {
		
		$.extend(view.params, {
	
			//"savedId" : 0,
			//"notes" : "",
			
			//"owner" : null
			//"shared" : false,
	
			"mode" : "explore",
			
			"drilldown" : [],
			"cuts" : [],
			"datefilters" : [],
			
		});
		
		view.cube = cubesviewer.getCube(view.params.cubename);
		
	}
	
	
	/*
	 * Draw cube view menu
	 */
	this.drawMenu = function(view) {
		
		// Add view menu options button
		$(view.container).find('.cv-view-toolbar').append(
			'<button class="viewbutton" title="View" style="margin-right: 5px;">View</button>'
		);
		
		$(view.container).find('.cv-view-viewmenu').append(
			'<ul class="cv-view-menu cv-view-menu-view" style="float: right; width: 180px;"></ul>'
		);
		
		// Buttonize
		$(view.container).find('.cv-view-toolbar').find('button').button();
		
		// Menu functionality
		view.cubesviewer.views.cube._initMenu(view, '.viewbutton', '.cv-view-menu-view');

	}
	
	/*
	 * Draw cube view structure.
	 */
	this.onViewDraw = function(event, view) {
		
		$(view.container).empty();
		$(view.container).append('<div class="cv-view-viewmenu"></div>');
		$(view.container).append('<div class="cv-view-viewinfo"></div>');
		$(view.container).append('<div class="cv-view-viewdata" style="clear: both;"></div>');
		$(view.container).append('<div class="cv-view-viewfooter" style="clear: both;"></div>');
		
		// Menu toolbar
		$(view.container).find('.cv-view-viewmenu').append(
			'<div style="float: right; z-index: 9990; "><div class="cv-view-toolbar ui-widget-header ui-corner-all">' +
			'</div></div>'
		);
		
		// Draw menu
		view.cubesviewer.views.cube.drawMenu(view);

	};

	/*
	 * Helper to configure a context menu opening reaction.
	 */
	this._initMenu = function (view, buttonSelector, menuSelector) {
		//view.cubesviewer.views.initMenu('.panelbutton', '.cv-view-menu-panel');
		$('.cv-view-toolbar', $(view.container)).find(buttonSelector).mouseenter(function() {

			$('.cv-view-menu').hide();

			var menu = $(menuSelector, $(view.container));

			menu.css("position", "absolute");
			menu.css("z-index", "9990");
			menu.show();

			menu.fadeIn().position({
				my : "right top",
				at : "right bottom",
				of : this
			});
			$(document).one("click", function() {
				menu.fadeOut();
			});
			return false;
		});

		$(menuSelector, $(view.container)).menu({}).hide();
		
	}
	
	/*
	 * Adjusts grids size
	 */
	this._adjustGridSize = function() {

		// TODO: use appropriate container width!
		var newWidth = $(window).width() - 350;

		$(".ui-jqgrid-btable").each(function(idx, el) {
			var currentWidth = $(el).width();
			if (newWidth < 600)
				newWidth = 600;
			if (currentWidth > newWidth) {
				$(el).setGridWidth(newWidth);
			}
		});
	};
	
	/*
	 * Composes a filter with appropriate syntax and time grain from a
	 * datefilter
	 * TODO: Improve this, now using date/month only, not real mapping to
	 * dimension grain.
	 */ 
	this.datefilterValue = function(datefilter) {

		var date_from = null;
		var date_to = null;

		if (datefilter.mode.indexOf("auto-") == 0) {
			if (datefilter.mode == "auto-last1m") {
				date_from = new Date();
				date_from.setMonth(date_from.getMonth() - 1);
			} else if (datefilter.mode == "auto-last3m") {
				date_from = new Date();
				date_from.setMonth(date_from.getMonth() - 3);
			} else if (datefilter.mode == "auto-last6m") {
				date_from = new Date();
				date_from.setMonth(date_from.getMonth() - 6);
			} else if (datefilter.mode == "auto-last12m") {
				date_from = new Date();
				date_from.setMonth(date_from.getMonth() - 12);
			} else if (datefilter.mode == "auto-january1st") {
				date_from = new Date();
				date_from.setMonth(0);
				date_from.setDate(1);
			}

		} else if (datefilter.mode == "custom") {
			if ((datefilter.date_from != null) && (datefilter.date_from != "")) {
				date_from = new Date(datefilter.date_from);
			}
			if ((datefilter.date_to != null) && (datefilter.date_to != "")) {
				date_to = new Date(datefilter.date_to);
			}
		}

		if ((date_from != null) || (date_to != null)) {
			var datefiltervalue = "";
			if (date_from != null)
				datefiltervalue = datefiltervalue
						+ this._datefiltercell(date_from);
			datefiltervalue = datefiltervalue + "-";
			if (date_to != null)
				datefiltervalue = datefiltervalue
						+ this._datefiltercell(date_to);
			return datefiltervalue;
		} else {
			return null;
		}

	};

	this._datefiltercell = function(tdate) {
		return tdate.getFullYear() + ","
				+ (Math.floor(tdate.getMonth() / 3) + 1) + ","
				+ (tdate.getMonth() + 1);
	};	
	
	/*
	 * Builds Cubes Server query parameters based on current view values.
	 */
	this.buildQueryParams = function(view, includeXAxis, onlyCuts) {

		var params = {};

		if (!onlyCuts) {
			var drilldown = view.params.drilldown.slice(0);

			// Include X Axis if necessary
			if (includeXAxis) {
				drilldown.splice(0, 0, view.params.xaxis);
			}

			// Include drilldown array
			if (drilldown.length > 0)
				params["drilldown"] = drilldown;
		}

		// Include cuts and datefilters
		var cuts = [];
		$(view.params.cuts).each(function(idx, e) {
			cuts.push(e.dimension + ":" + e.value);
		});
		$(view.params.datefilters).each(function(idx, e) {
			var datefiltervalue = view.cubesviewer.views.cube.datefilterValue(e);
			if (datefiltervalue != null) {
				cuts.push(e.dimension + ":" + datefiltervalue);
			}
		});
		// Join different cut conditions
		if (cuts.length > 0)
			params["cut"] = cuts.join("|");

		return params;
	};

};

/*
 * Create object.
 */
cubesviewer.views.cube = new cubesviewerViewCube();

/*
 * Bind events.
 */
$(document).bind("cubesviewerViewCreate", { }, cubesviewer.views.cube.onViewCreate);
$(document).bind("cubesviewerViewDraw", { }, cubesviewer.views.cube.onViewDraw);

// Resize grids as appropriate
$(window).bind('resize', function() {
	cubesviewer.views.cube._adjustGridSize();
}).trigger('resize');
