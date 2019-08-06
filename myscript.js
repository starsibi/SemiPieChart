//Utility methods 

var percToDeg = function (perc) {
  return perc * 360;
};

var percToRad = function (perc) {
  return degToRad(percToDeg(perc));
};

var degToRad = function (deg) {
  return deg * Math.PI / 180;
};

; (function ($, window, undefined) {

  var $duration = 500;

  function GetId(input) {
      return input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
  }

  function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  function ShowLableOutSide(option, svg, pie, data, arc, outerArc) {

      var text = svg.select(".labelName").selectAll("text")
          .data(pie(data), function (d) { return d.data.key });

      text.enter()
          .append("text")
          .attr("class", "noevent")
          .attr("dy", ".35em")
          .attr("x", ".35em")
          .html(function (d) {
              if (option.LabelSetting && option.LabelSetting.CustomLabelFormatName)
                  return executeFunctionByName(option.LabelSetting.CustomLabelFormatName, window, d);
              else
                  return d.value;
          })
          .transition().duration($duration)
          .attrTween("transform", function (d) {
              this._current = this._current || d;
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function (t) {
                  var d2 = interpolate(t);
                  var pos = outerArc.centroid(d2);
                  var ss = option.width / 2;
                  pos[0] = ss * (midAngle(d2) < Math.PI ? 1 : -1.1);
                  return "translate(" + pos + ")";
              };
          });

      /*.styleTween("text-anchor", function (d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function (t) {
              var d2 = interpolate(t);
              return midAngle(d2) < Math.PI ? "start" : "end";
          };
      });
      */

      text.exit()
          .remove();

      /* ------- SLICE TO TEXT POLYLINES -------*/

      var polyline = svg.select(".lines").selectAll("polyline")
          .data(pie(data), function (d) { return d.data.key });

      polyline.enter()
          .append("polyline");

      polyline.transition().duration($duration)
          .attrTween("points", function (d) {
              this._current = this._current || d;
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function (t) {
                  var d2 = interpolate(t);
                  var pos = outerArc.centroid(d2);
                  var ss = option.width / 2;
                  pos[0] = ss * (midAngle(d2) < Math.PI ? 1 : -.9);
                  return [arc.centroid(d2), outerArc.centroid(d2), pos];
              };
          });

      polyline.exit()
          .remove();
  };

  function ShowLableInSide($id, option, svg, pie, data, arc, outerArc) {
      if (option.chartType === 'gauge') {
          var slice = svg.select(".lines").selectAll("path.slice")
                          .data(pie(data), function (d) { return d.data.key });

          var paths = slice.enter()
                              .append("path")
                              .style("fill", function (d) { return d.data.fillcolor; })
                              .attr("class", "hiddenDonutArcs")
                              //.attr("d", arc)
                              .attr("id", function (d, i) {
                                  return GetId($id + "donutArcSlices" + d.data.key + i);
                              })
                              .attr("data-num", function (d) {
                                  return d.data.value;
                              })
                              .style("fill", "none");


          SetStartAndEndAngleOFGuageChart(paths, data, arc);
          paths.each(function (d, i) {
              var firstArcSection = /(^.+?)L/;
              var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
              newArc = newArc.replace(/,/g, " ");
              $(this).attr("d", newArc);
          });

          svg.select(".labelName").selectAll("text")
              .data(pie(data), function (d) { return d.data.key })
              .enter().append("text")
              .attr("class", "donutText noevent")
              .attr("dy", function () {
                  if (option.LabelSetting) {
                      if (option.LabelSetting.LabelPosition <= 3) {
                          return 18;
                      } else {
                          return -18;
                      }
                  }
              })
              .append("textPath")
              .attr("startOffset", function () {
                  if (option.LabelSetting) {
                      switch (option.LabelSetting.LabelPosition) {
                          case 1:
                          case 4:
                              return "5%";
                              break;
                          case 2:
                          case 5:
                              return "50%";
                          case 3:
                          case 6:
                              return "95%";
                          default:
                              return "50%";

                      }
                  }
              })
              .style("text-anchor", function () {
                  if (option.LabelSetting) {
                      switch (option.LabelSetting.LabelPosition) {
                          case 1:
                          case 4:
                              return "start";
                              break;
                          case 2:
                          case 5:
                              return "middle";
                          case 3:
                          case 6:
                              return "end";
                          default:
                              return "middle";

                      }
                  }
              })
              .style("fill", "#fff")
              .attr("xlink:href", function (d, i) { return "#" + GetId($id + "donutArcSlices" + d.data.key + i) })
              .html(function (d) {
                  if (option.LabelSetting && option.LabelSetting.CustomLabelFormatName)
                      return executeFunctionByName(option.LabelSetting.CustomLabelFormatName, window, d);
                  else
                      return d.value;
              });
      }
      else {
          var slice = svg.select(".lines").selectAll("path.slice")
                          .data(pie(data), function (d) { return d.data.key });

          var paths = slice.enter()
                              .append("path")
                              .style("fill", function (d) { return d.data.fillcolor; })
                              .attr("class", "hiddenDonutArcs")
                              .attr("d", arc)
                              .attr("id", function (d, i) {
                                  return GetId($id + "donutArcSlices" + d.data.key + i);
                              })
                              .attr("data-num", function (d) {
                                  return d.data.value;
                              })
                              .style("fill", "none");

          paths.each(function (d, i) {
              var firstArcSection = /(^.+?)L/;
              var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
              newArc = newArc.replace(/,/g, " ");
              $(this).attr("d", newArc);
          });



          svg.select(".labelName").selectAll("text")
              .data(pie(data), function (d) { return d.data.key })
              .enter().append("text")
              .attr("class", "donutText noevent")
              .attr("dy", function () {
                  if (option.LabelSetting) {
                      if (option.LabelSetting.LabelPosition <= 3) {
                          return 18;
                      } else {
                          return -18;
                      }
                  }
              })
              .append("textPath")
              .attr("startOffset", function () {
                  if (option.LabelSetting) {
                      switch (option.LabelSetting.LabelPosition) {
                          case 1:
                          case 4:
                              return "5%";
                              break;
                          case 2:
                          case 5:
                              return "50%";
                          case 3:
                          case 6:
                              return "95%";
                          default:
                              return "50%";

                      }
                  }
              })
              .style("text-anchor", function () {
                  if (option.LabelSetting) {
                      switch (option.LabelSetting.LabelPosition) {
                          case 1:
                          case 4:
                              return "start";
                              break;
                          case 2:
                          case 5:
                              return "middle";
                          case 3:
                          case 6:
                              return "end";
                          default:
                              return "middle";

                      }
                  }
              })
              .style("fill", "#fff")
              .attr("xlink:href", function (d, i) { return "#" + GetId($id + "donutArcSlices" + d.data.key + i) })
              .html(function (d) {
                  if (option.LabelSetting && option.LabelSetting.CustomLabelFormatName)
                      return executeFunctionByName(option.LabelSetting.CustomLabelFormatName, window, d);
                  else
                      return d.value;
              });
      }
  }

  function SetStartAndEndAngleOFGuage(dataLength) {
      this.perc = 0.5;
      this.next_start = .75;
      this.dataLength = dataLength;
  }

  function SetStartAndEndAngleOFGuageChart(paths, data, arc) {
      var obj = new SetStartAndEndAngleOFGuage(data.length);
      paths.each(function (d, i) {
          var arc1 = arc;
          var arcStartRad = percToRad(obj.next_start);
          var arcEndRad = arcStartRad + percToRad(obj.perc / obj.dataLength);
          obj.next_start += obj.perc / obj.dataLength;
          arc1.startAngle(arcStartRad).endAngle(arcEndRad);
          $(this).attr("d", arc1);
      });
  }

  function SetStartAndEndAngleOFGuageChartForPath(svg, path, arc) {
      var nodes = Array.prototype.slice.call($(svg).find("path.arc.slice"));
      var _index = nodes.indexOf(d3.select(path)[0][0]);
      var obj = new SetStartAndEndAngleOFGuage(nodes.length);
      var arc1 = arc;
      for (var i = 1; i <= _index; i++) {
          obj.next_start += obj.perc / obj.dataLength;
      }
      var arcStartRad = percToRad(obj.next_start);
      var arcEndRad = arcStartRad + percToRad(obj.perc / obj.dataLength);
      arc1.startAngle(arcStartRad).endAngle(arcEndRad);
      return arc1;
  }

  function SemiCircle(svg, option) {
      var arcShadow = d3.svg.arc()
              .innerRadius(option.radius + option.outerRadius)
              .outerRadius(option.radius + option.outerRadius + 20)
              .padAngle(option.padAngle)
              .startAngle(0)
              .endAngle(Math.PI);


      var defs = svg.append("defs");
      var gradient = defs.append("linearGradient").attr({ "id": "svgGradient", "x1": "0%", "x2": "100%", "y1": "0%", "y2": "0%" });
      gradient.append("stop").attr({ "offset": "0%", "stop-color": "#000", "stop-opacity": 1 });
      gradient.append("stop").attr({ "offset": "100%", "stop-color": "#fff", "stop-opacity": 0 });
      var path = svg.append('path').attr({ "fill": "url(#svgGradient)", d: arcShadow, transform: 'rotate(-90)' })

      path.transition().duration($duration * 2).attrTween('d', function (d) {
          var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function (t) {
              return arcShadow(interpolate(t));
          };
      });

  }

  function PieSlices($id, svg, pie, data, option, arc) {
      if (option.chartType === 'gauge') {
          var percToDeg = function (perc) {
              return perc * 360;
          };

          var percToRad = function (perc) {
              return degToRad(percToDeg(perc));
          };

          var degToRad = function (deg) {
              return deg * Math.PI / 180;
          };

          SemiCircle(svg, option);
          var value = 50;
          var gaugeMaxValue = data.reduce(dls_th_Cb_Find_Total, 0);
          var percentValue = value / gaugeMaxValue;
          var percent = percentValue;
          var chart = svg.select(".slices");

          var slice = chart.selectAll("path.slice")
                     .data(pie(data), function (d) {return d.data.key });
          var cu = ChartUtility($('#' + $id));
          var paths = slice.enter().insert("path")
                           .style("fill", function (d) { return d.data.fillcolor; })
                           .attr("id", function (d, i) {
                               return GetId($id + d.data.key) + i;
                           })
                           .attr("class", function (d, i) {
                               return "arc slice slice" + i;
                           })
                           .on("mouseover", cu.OnMouseover.Slices)
                           .on("mouseout", cu.OnMouseout.Slices)
                           .on("click", cu.OnClick.Slices)
                           .transition()
                           .duration($duration * 2);

          SetStartAndEndAngleOFGuageChart(paths, data, arc);
          // var Needle = (function () {

          //     var recalcPointerPos = function (perc) {
          //         var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
          //         thetaRad = percToRad(perc / 2);
          //         centerX = 0;
          //         centerY = 0;
          //         topX = centerX - this.len * Math.cos(thetaRad);
          //         topY = centerY - this.len * Math.sin(thetaRad);
          //         leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
          //         leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
          //         rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
          //         rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
          //         return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
          //     };

          //     function Needle(el, option) {
          //         this.el = el;
          //         this.len = option.radius;
          //         this.radius = option.radius / 15;
          //     }

          //     Needle.prototype.render = function () {

          //         this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);

          //         this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0))
          //                     .transition()
          //                     .style("stroke-opacity", 0.5);
          //         return this.el;

          //     };

          //     Needle.prototype.moveTo = function (perc) {
          //         var self, oldValue = this.perc || 0;
          //         this.perc = perc;
          //         self = this;
          //         // Reset pointer position
          //         this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function () {
          //             return function (percentOfPercent) {
          //                 var progress = (1 - percentOfPercent) * oldValue;
          //                 return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
          //             };
          //         });

          //         this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function () {
          //             return function (percentOfPercent) {
          //                 var progress = percentOfPercent * perc;
          //                 return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
          //             };
          //         });

          //     };

          //     return Needle;

          // })();
          // var needle = new Needle(chart, option);
          // needle.render();
          // needle.moveTo(percent);
      }
      else {
          var slice = svg.select(".slices").selectAll("path.slice")
                     .data(pie(data), function (d) { return d.data.key });
          var cu = ChartUtility($('#' + $id));
          var paths = slice.enter()
                    .insert("path")
                    .style("fill", function (d) { return d.data.fillcolor; })
                    .attr("id", function (d, i) {
                        return GetId($id + d.data.key) + i;
                    })
                    .attr("class", "slice")
                    .on("mouseover", cu.OnMouseover.Slices)
                    .on("mouseout", cu.OnMouseout.Slices)
                    .on("click", cu.OnClick.Slices)
                    .transition()
                        .duration($duration * 2)
                        .attrTween('d', function (d) {
                            var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                            return function (t) {
                                return arc(interpolate(t));
                            };
                        });



          if (option.Is3dChart) {
              DrawInnerShadow(slice, option);
          }

          slice.exit().remove();
      }
  }

  function DrawChart($id, option, data) {
    
      var _cu = new ChartUtility($('#' + $id)),
          svg = _cu.SvgSetUp($id, option),          
          pie = d3.layout.pie().sort(null).value(function (d) {             
             return d.value; });
      RrdlLoadChart(_cu, svg, pie, $id, option, data);
  }

  function DrawInnerShadow(slice, option) {
      var arcShadow = d3.svg.arc()
                            .innerRadius(option.innerRadiusArcShadow)
                            .outerRadius(option.outerRadiusArcShadow)
                            .padAngle(option.padAngle);

      var path = slice.enter()
              .insert("path")
              .attr({
                  class: 'pathshadow',
                  d: arcShadow,
                  fill: function (d, i) {
                      var c = d3.hsl(d.data.fillcolor);
                      return d3.hsl((c.h + 5), (c.s - .07), (c.l - .15));
                  }
              });

      path.transition()
              .duration($duration * 2)
              .attrTween('d', function (d) {
                  var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                  return function (t) {
                      return arcShadow(interpolate(t));
                  };
              });
  }

  function RrdlLoadChart(_cu, svg, pie, $id, option, data) {
      var arc = GetArc(option),
          outerArc = GetArcOver(option);

      PieSlices($id, svg, pie, data, option, arc);
      if (option.LegendSetting) {
          appendLegend($id, option, data, pie);
      }


      if (option.LabelSetting && option.LabelSetting.ShowLabel) {
          if (option.LabelSetting && option.LabelSetting.ShowLabel && option.LabelSetting.LabelPosition > 3) {
              ShowLableOutSide(option, svg, pie, data, arc, outerArc);
          }
          if (option.LabelSetting && option.LabelSetting.ShowLabel && option.LabelSetting.LabelPosition <= 3) {
              ShowLableInSide($id, option, svg, pie, data, arc, outerArc);
          }
      }
      if (option.chartType === 'donut') {
          appendCenterCircle(svg, option, data, pie);
      }
      else if (option.chartType === 'gauge') {
          BindTotoalTextElement(svg.select(".slices"), data, option, pie);
      } else {
          appendPiLabel($id, svg, option, data, pie);
      }
  }

  function appendPiLabel($id, svgCon, option, data, pie) {
      var labelHeight = 50;
      var cu = new ChartUtility($('#' + $id));

      var currentYpos = $('#' + $id).find('g.slicesGroup').data('y');
      currentYpos = parseInt(currentYpos);
      var svg = d3.select('#' + $id).select('svg').append("g")
                  .on("mouseover", cu.OnMouseover.Center)
                  .on("mouseout", cu.OnMouseout.Center)
                  .on("click", cu.OnClick.Center)      
      var rectangle = svg.append("rect")
                          .style("cursor", "pointer")
                          .attr("width", option.size)
                          .attr("height", 50)
                          .style("fill", "transparent");

      var total = data.reduce(dls_th_Cb_Find_Total, 0);
      currentYpos = currentYpos + 20;
      var circletextvalue = svg.append("text")
                                  .data(pie(data))
                                  .style("cursor", "pointer")
                                  .style("fill", "#00000")
                                  .attr("y", currentYpos)
                                  .attr("x", "50%")
                                  .attr("data-value", total)
                                  .attr("data-total", total)
                                  .style("text-anchor", "middle")
                                  .text(total);
      currentYpos = currentYpos + 15;
      var circletextKey = svg.append("text")
                                  .style("cursor", "pointer")
                                  .data(pie(data))
                                  .attr("y", currentYpos)
                                  .attr("x", "50%")
                                  .attr("data-key", '')
                                  .attr("data-total", option.totalValueDescription)
                                  .style("text-anchor", "middle")
                                  .text(option.totalValueDescription);
  }

  function appendLegend($id, option, data, pie) {
      VerticalLegend($id, option, data, pie);
  }

  function VerticalLegend($id, option, data, pie) {
      var cu = ChartUtility($('#' + $id));
      var svgRow = d3.select("#" + $id);
      var ultag;
      var css = option.LegendSetting.columnSize + ' legend-container ';
      if (option.LegendSetting.position == 1) {
          ultag = svgRow.append("div");
          css += " " + 'left-border';
      } else if (option.LegendSetting.position == 2) {
          ultag = svgRow.insert("div", ":first-child");
          css += " " + 'right-border';
      }
      var spantagcon = ultag.style("height", option.height + "px")
             .attr('class', css)
             .append('div')
             .attr('class', 'legend')
             .append('div').attr('class', 'legend-entry');

      spantagcon.selectAll("span")
      .data(data)
      .enter()
      .append("span")
      .attr('id', function (d, i) {
          return 'legend' + GetId($id + d.key) + i;
      })
      .attr("class", 'legend-label')
      .style("color", function (d) { return d.fillcolor })
      .on("mouseover", cu.OnMouseover.Legend)
      .on("mouseout", cu.OnMouseout.Legend)
      .on("click", cu.OnClick.Legend)
      .append('span').text(function (d) {
          return d.key;
      });

      var objTitle = option.LegendSetting.legendTitle;
      if (objTitle) {
          var height = option.height;
          if (objTitle.title != null && objTitle.title != undefined && objTitle.title.trim().length > 0) {
              height += 30;
          }
          if (objTitle.subTitle != null && objTitle.subTitle != undefined && objTitle.subTitle.trim().length > 0) {
              height += 20;
          }
          ultag.style("height", height + "px");
          var $title = GetTitleDom(objTitle);
          if (objTitle.position == "bottom") {
              $(spantagcon[0]).append($title);
          } else {
              $(spantagcon[0]).prepend($title);
          }
      }
  }

  function GetArc(option) {
      if (option.chartType === 'pie') {
          return d3.svg.arc()
                  .outerRadius(option.radius)
                  .innerRadius(0)
                  .padAngle(option.padAngle);

      } else if (option.chartType === 'gauge') {
          if (option.outerRadius == null || option.outerRadius == undefined || option.outerRadius == "" || option.outerRadius <= 0) {
              option.outerRadius = 30;
          }
          return d3.svg.arc()
                              .innerRadius(option.radius)
                              .outerRadius(option.radius + option.outerRadius)
                              .padAngle(option.padAngle)
      } else {
          return d3.svg.arc()
                  .outerRadius(option.radius + option.outerRadius)
                  .innerRadius(option.radius)
                  //.cornerRadius(3)
                  .padAngle(option.padAngle);
      }
  }

  function GetArcOver(option, extra) {
      if (option.chartType === 'pie') {
          return d3.svg.arc()
                  .innerRadius(option.radius + 20)
                  .outerRadius(0)
                  .padAngle(option.padAngle);
      }
      else if (option.chartType === 'gauge') {
          if (option.outerRadius == null || option.outerRadius == undefined || option.outerRadius == "" || option.outerRadius <= 0) {
              option.outerRadius = 30;
          }
          return d3.svg.arc()
                              .innerRadius(option.radius)
                              .outerRadius(option.radius + option.outerRadius + 20)
                              .padAngle(option.padAngle)
      } else {
          return d3.svg.arc()
                  .innerRadius(option.radius)
                  .outerRadius(option.radius + option.outerRadius + 20)
                  //.cornerRadius(3)
                  .padAngle(option.padAngle);
      }
  }

  var ChartUtility = function (obj) {

      this.element = obj;

      this.GetOption = function (cb) {
          var setting = eval($(this.element).attr("rrdl-pi-chart-option"));
          if (!setting) {
              console.error('error occur when init Pie Chart.');
              cb(null);
          }
          var option = setting.option || {};
          option.chartType = $(this.element).data('chartType');
          option.radius = option.radius || 100;
          if (option.chartType === 'donut' || option.chartType === 'gauge') {
              option.outerRadius = setting.option.outerRadius || Math.min(75, setting.option.radius * .6);
          }
          else {
              option.outerRadius = 0;
          }

          option.width = option.width ? option.width : (option.radius + option.outerRadius) * 2;
          option.height = option.height ? option.height : (option.radius + option.outerRadius) * 2;
          option.radius = Math.min(option.width / 2, option.height / 2, option.radius);

          option.columnSize = option.columnSize.replace();

          if (option.chartType === 'donut' && Math.min(option.width, option.height) <= option.radius * 2 + option.outerRadius) {
              option.radius = option.radius - option.outerRadius;
          }

          if (option.Is3dChart) {
              option.ShadowWidth = option.radius * .2;
              option.outerRadiusArcShadow = option.radius;
              option.innerRadiusArcShadow = option.radius - option.ShadowWidth;
          }
          if (option.padAngle) {
              option.padAngle = option.padAngle;
          }
          GetPieChartData(setting, function (data) {
              cb(option, data);
          })
      }

      function GetPieChartData(setting, cb) {
          var olddata = $(this.element).data('chart');
          if (olddata && olddata.length > 0) {
              cb(olddata);
          } else if (setting.data) {
              if (setting.data.data) {

                  cb(setting.data.data);

              } else if (setting.data.AjaxData) {

                  $.ajax({
                      url: setting.data.AjaxData.URL,
                      method: setting.data.AjaxData.method || 'Get',
                      beforeSend: function (jqXHR, settings) {
                          if (setting.data.ajaxDataEvent && setting.data.ajaxDataEvent.BeginCallBack)
                              executeFunctionByName(setting.data.ajaxDataEvent.BeginCallBack, window, jqXHR, settings);

                      },
                      error: function (jqXHR, textStatus, errorThrown) {
                          if (setting.data.ajaxDataEvent && setting.data.ajaxDataEvent.FailerCallBack)
                              executeFunctionByName(setting.data.ajaxDataEvent.FailerCallBack, window, jqXHR, textStatus, errorThrown);
                      },
                      complete: function (jqXHR, textStatus) {
                          if (setting.data.ajaxDataEvent && setting.data.ajaxDataEvent.CompletedCallBack)
                              executeFunctionByName(setting.data.ajaxDataEvent.CompletedCallBack, window, jqXHR, textStatus);

                      },
                      success: function (data, textStatus, jqXHR) {
                          if (setting.data.ajaxDataEvent && setting.data.ajaxDataEvent.SuccessCallBack) {
                              executeFunctionByName(setting.data.ajaxDataEvent.SuccessCallBack, window, data, textStatus, jqXHR);
                              cb(data);
                          } else {
                              cb(data);
                          }
                      }

                  });

              } else {
                  console.log('No Data found rrror occur when init pie chart.');
              }
          }
      }

      this.SvgSetUp = function ($id, option) {
          //var y = 0;
          if (option.chartType == "gauge") {
              option.width = option.width;
              option.height = option.height;
          } else {
              option.width = option.width + 50;
              option.height = option.height + 50;
          }

          var svgRow = d3.select("#" + $id);

          var css = option.columnSize + " svg-container";
          var svgColLeft = svgRow.append('div').attr('class', css);


          var svg = svgColLeft.append("svg").style("height", option.height)
                          .attr('overflow', 'visible');

          var group = svg.append("g").attr("class", "slicesGroup").attr('data-y', option.height);
          group.append("g").attr("class", "slices");

          group.append("g").attr("class", "labelName");

          group.append("g").attr("class", "lines");


          if (option.chartType == "gauge") {
              group.attr("transform", "translate(" + (option.width) + "," + (option.height) + ")");
          } else {
              group.attr("transform", "translate(" + option.width / 2 + "," + (option.height / 2) + ")");
          }

          $("#" + $id).css({
              'position': 'relative',
              /*'width': option.width,
              'height': option.height,*/
              padding: 0
          });

          $title = GetTitleDom(option.svgTitle);
          $($title).css("width", ((option.radius * 2) + 200));
          if (option.svgTitle.position == 'bottom') {
              $(svgColLeft[0][0]).append($title);
          }
          else {
              $(svgColLeft[0][0]).prepend($title);
          }

          return group;
      }

      this.OnMouseover = {
          Slices: function (d) {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              var $numverElement = $(divParent).find("text[data-value]");
              var $shipmentElement = $(divParent).find("text[data-key]");
              $numverElement.html(d.data.value);
              $shipmentElement.html(d.data.key);
              var arcOver = GetArcOver(option);
              if (option.chartType == "gauge") {
                  SetStartAndEndAngleOFGuageChartForPath($(divParent).find("svg"), this, arcOver);
              }
              d3.select(this).transition()
                              .duration($duration)
                              .attr("d", arcOver);

              d3.select("#legend" + $(this).attr("id")).transition()
              .duration($duration).attr("class", "legend-label hovered");


          },
          Center: function () {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              var $svg = $(divParent).find("svg");
              var arcOver = GetArcOver(option, 5);
              $($svg).find('g.slices').find('path.slice').each(function () {
                  d3.select(this).transition().duration($duration).attr("d", arcOver);
              });
              $(divParent).find('div.legend div.legend-entry').find('span.legend-label').each(function () {
                  d3.select(this).transition()
                                  .duration($duration)
                                  .attr("class", "legend-label hovered");
              });
          },
          Legend: function (d) {
              var id = d3.select(this).attr('id').replace('legend', '');
              $('#' + id).triggerSVGEvent('mouseover');
          }
      };

      this.OnMouseout = {
          Slices: function (d) {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              var $numverElement = $(divParent).find("text[data-value]");
              var $shipmentElement = $(divParent).find("text[data-key]");
              $numverElement.text($numverElement.attr("data-total"));
              $shipmentElement.text($shipmentElement.attr("data-total"));
              var arc = GetArc(option);
              if (option.chartType == "gauge") {
                  SetStartAndEndAngleOFGuageChartForPath($(divParent).find("svg"), this, arc);
              }
              d3.select(this).transition()
                 .duration($duration)
                              .attr("d", arc);

              d3.select("#legend" + $(this).attr("id")).transition()
              .duration($duration).attr("class", "legend-label");
          },
          Center: function () {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              var $svg = $(divParent).find("svg");
              var arc = GetArc(option);
              $($svg).find('g.slices').find('path.slice').each(function () {
                  d3.select(this).transition().duration($duration).attr("d", arc);
              });

              $(divParent).find('div.legend div.legend-entry').find('span.legend-label').each(function () {
                  d3.select(this).transition()
                                  .duration($duration)
                                  .attr("class", "legend-label");
              });
          },
          Legend: function (d) {
              var id = d3.select(this).attr('id').replace('legend', '');
              $('#' + id).triggerSVGEvent('mouseout')
          }
      };

      this.OnClick = {
          Slices: function (d) {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              if (option.ClientSideEvent && option.ClientSideEvent.onArcClick)
                  executeFunctionByName(option.ClientSideEvent.onArcClick, window, d.data);
          },
          Center: function () {
              var divParent = $(this).parents('div.rrdl-pi-chart');
              var option = $(divParent).data();
              if (option.ClientSideEvent && option.ClientSideEvent.onTotalClick) {
                  var svgData = $(this).closest('div.rrdl-pi-chart').data('chart');
                  executeFunctionByName(option.ClientSideEvent.onTotalClick, window, svgData);
              }
          },
          Legend: function () {
              var id = d3.select(this).attr('data-sliceId');
              $(id).triggerSVGEvent('click');
          }
      }

      function SetTitle(option, svg) {
          var svgTitle = option.svgTitle || {};
          var y = 0;
          var height = option.height;
          if (option.chartType === 'pie')
              height = height + 30;
          if (svgTitle.title || svgTitle.subTitle) {
              var textGroup = svg.append("g").attr("class", "title");
              var x = option.width / 2;
              if (option.chartType === "gauge") {
                  var x = option.width;
              }
              if (svgTitle.title) {
                  y = y + 15;
                  textGroup.append("text")
                      .attr("x", x)
                      .attr("y", y)
                      .attr("text-anchor", "middle")
                      .style("font-size", "16px")
                      .attr("class", "title-header")
                      .text(svgTitle.title);
              }
              if (svgTitle.subTitle) {
                  y = y + 15;
                  textGroup.append("text")
                       .attr("x", x)
                       .attr("y", y)
                       .attr("text-anchor", "middle")
                       .style("font-size", "12px")
                       .attr("class", "title-sub-header")
                       .text(svgTitle.subTitle);
              }
              option.height = height + y;
          }

      }

      return this;
  }

  function GetTitleDom(objTitle) {
      var h2Header = $("<h2>");
      if (objTitle.title != null && objTitle.title != undefined && objTitle.title.trim().length > 0) {
          h2Header.text(objTitle.title);
          h2Header.addClass("legend-label-header");
      }
      if (objTitle.subTitle != null && objTitle.subTitle != undefined && objTitle.subTitle.trim().length > 0) {
          h2SubHeader = $("<span>", {
              text: objTitle.subTitle
          });
          h2Header.append(h2SubHeader);
      }
      return h2Header;
  }

  $.fn.triggerSVGEvent = function (eventName) {
      var event = document.createEvent('SVGEvents');
      event.initEvent(eventName, true, true);
      this[0].dispatchEvent(event);
      return $(this);
  };

  function appendCenterCircle(svgCon, option, data, pie) {
      var cu = ChartUtility($(svgCon).parents('div.rrdl-pi-chart'));
      var group = svgCon.append("g").on("click", cu.OnClick.Center);
      var circleRadious = option.radius;
      if (option.Is3dChart) {
          circleRadious = option.innerRadiusArcShadow;
      }

      group.append("circle")
                  .on("mouseover", cu.OnMouseover.Center)
                  .on("mouseout", cu.OnMouseout.Center)
                  .style("cursor", "pointer")
                  .attr("r", circleRadious)
                  .style("fill", "transparent");
      BindTotoalTextElement(group, data, option, pie);
  }

  function BindTotoalTextElement(parent, data, option, pie) {
      var total = data.reduce(dls_th_Cb_Find_Total, 0);
      var circletextvalue = parent.append("text")
                                  .data(pie(data))
                                  .attr('class', "text-total-value")
                                  .style("cursor", "pointer")
                                  .style("fill", "#00000")
                                  .attr("y", "-5%")
                                  .style("alignment-baseline", "middle")
                                  .attr("data-value", total)
                                  .attr("data-total", total)
                                  .style("text-anchor", "middle")
                                  .style("font-size", "20px")
                                  .text(total);

      var circletextKey = parent.append("text")
                                  .attr('class', "text-total-label")
                                  .style("cursor", "pointer")
                                  .data(pie(data))
                                  .attr("dy", ".35em")
                                  .style("alignment-baseline", "middle")
                                  .attr("data-key", '')
                                  .attr("data-total", option.totalValueDescription || '')
                                  .style("text-anchor", "middle")
                                  .text(option.totalValueDescription || '');
  }

  function dls_th_Cb_Find_Total(accumulator, currentValue, currentIndex, array) {
      return accumulator + currentValue.value;
  }

  $.fn.extend({
      RrdlChart: function () {
          return {
              element: $(this),
              Init: function () {                  
                  var $id = $(this.element).attr('id');
                  var _cu = new ChartUtility(this.element);
                  _cu.GetOption(function (option, data) {
                      $(_cu.element).data({ 'chart': data });
                      var $id = $(_cu.element).attr('id');
                      if (!option.disableAutoInit) {
                          $(_cu.element).data(option);
                          if (!$(_cu.element).hasClass('svg-image')) {
                              $(_cu.element).html('');
                              $(_cu.element).addClass('svg-image');
                              DrawChart($id, option, data);
                          }

                      } else {
                          $(_cu.element).removeClass('svg-image');
                          //ChartUtility(option).AppendSvg($id);
                          option.disableAutoInit = false;
                      }
                  });
                  return this.element;
              },
              Destroy: function () {
                  $(this.element).removeClass('svg-image');
                  $(this.element).html('');
                  return this.element;
              },
              AddSegment: function (key, value, fillcolor, strokeWidth, stroke) {
                  var _this = this.element;
                  var dataset = $(_this).data('chart');
                  var _data = {
                      'key': key,
                      'value': value,
                      fillcolor: fillcolor,
                      strokeWidth: strokeWidth,
                      stroke: stroke
                  }
                  var data;
                  $.each(dataset, function (i, v) {
                      if (v && v.key === key) {
                          data = dataset.splice(i, 1);
                      }
                  });
                  if (data && data.length > 0) {
                      _data.value = _data.value + data[0].value;
                  }
                  dataset.push(_data);
                  updateChart(_this, dataset);
                  return this.element;
              },
              UpdateSegment: function (key, value, fillcolor, strokeWidth, stroke) {
                  this.RemoveSegment(key);
                  this.AddSegment(key, value, fillcolor, strokeWidth, stroke);
                  return this.element;
              },
              RemoveSegment: function (name) {
                  var _this = this.element;
                  var dataset = $(_this).data('chart');
                  var data;
                  $.each(dataset, function (i, v) {
                      if (v && v.key === name) {
                          data = dataset.splice(i, 1);
                      }
                  });
                  updateChart(_this, dataset);
                  return this;
              }
          }
      }
  });

  function updateChart(obj, dataset) {
      $(obj).data('chart', dataset);
      var sel = $(obj).html('');
      $(obj).removeClass('svg-image')
      $(obj).data('disableAutoInit', false);
      $(obj).RrdlChart().Init();
  };

})(jQuery, window)

$(function () {
  $(document).ready(function () {
      $('div.rrdl-pi-chart').each(function () {
          $(this).RrdlChart().Init();
      });
  });
})



