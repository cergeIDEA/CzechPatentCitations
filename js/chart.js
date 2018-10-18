      //General setup of fundamental variables and function used in the <body onload> (DrawAllCharts)

      var color, svg, width, height,svgmargin, t, treemap, parentselector,root,sortedData;

      var sumBys = {
          All: 'Všechny',
          CZ: 'České',
          INT: 'Zahraniční'
      };
      var sumBy = 'citations_All';

      var filters = {
          All: "Všechny",
          top100: "Prvních 100",
          top50: "Prvních 50",
          top20: "Prvních 20"
      };
      var filterInst = 'All'

      const InstTypes = ['podnik', 'avcr', 'vvs', 'ovo'];

      var selectedInstTypes = InstTypes;

      //Data for the legend of institutions
      var legendTexts = [{
              name: 'Podniky',
              id: 'podnik',
              color: 'blue'
          },
          {
              name: 'Akademie věd',
              id: 'avcr',
              color: 'orange'
          },
          {
              name: 'Veřejné vysoké školy',
              id: 'vvs',
              color: 'green'
          },
          {
              name: 'Ostatní výzkumné organizace',
              id: 'ovo',
              color: 'red'
          }
      ];

      //Function used in body onload, generating divs for the chart, select and legend
      function DrawAllCharts() {
          //Main chartcontainer = controls + treemap
          height = ($(window).height() * 0.85) - 110;
          width = Math.min($(window).width() * 0.6,880) //no chart margin
          svgmargin = 120

          chartcontainer = $('#app .chartcontainer')
          //Container for controls = select + legend
          controls = $('<div />', {
              id: 'controls',
              width:width
          })
          chartcontainer.append(controls)
          //Select = list of institutions
          title = $('<h4>Počet citací patentů</h4>')
          controls.append(title)


          // custom matching function for Select2 so that ICO match is allowed
          function matchCustom(params, data) {
            // If there are no search terms, return all of the data
            if ($.trim(params.term) === '') {
              return data;
            }
        
            // Do not display the item if there is no 'text' property
            if (typeof data.text === 'undefined') {
              return null;
            }
        
            // `params.term` should be the term that is used for searching
            // `data.text` is the text that is displayed for the data object
            if (data.text.indexOf(params.term) > -1) {
              var modifiedData = $.extend({}, data, true);
        
              // You can return modified objects from here
              // This includes matching the `children` how you want in nested data sets
              return modifiedData;
            }
            if (typeof data.ico !== 'undefined') {
                if (data.ico.toString().indexOf(params.term) > -1) {
                    var modifiedData = $.extend({}, data, true);
            
                    // You can return modified objects from here
                    // This includes matching the `children` how you want in nested data sets
                    return modifiedData;
                }
            }
            // Return `null` if the term should not be displayed
            return null;
        }
        
          select = $('<select />', {
              id: 'ddlSearch',
              //   onchange: 'changeSearchDDL()'
          })
          select.append('<option />')
          controls.append(select)
          $('#ddlSearch').on('select2:select', changeSearchDDL)
          $('#ddlSearch').select2({
              data: menudata,
              width: width - title.outerWidth() - svgmargin,
              allowClear: false,
              matcher:matchCustom,
              multiple: false,
              placeholder: 'Vyhledejte organizaci či IČO...'
          });
          //Reset buttion for select
          //controls.append($('<a id="rstBtn" class="button buttonPassive" onclick="Redraw((),true,true)">Obnovit</a>'));

          switchers = $('<div />', {id:'switchers'})
          controls.append(switchers)
        
          // Generate Filtering switcher
          switchers.append(generateSwitcher('swFilters', filters, 'filterInstitutions','Počet institucí: '))
          
          //Generate Citations switcher
          switchers.append(generateSwitcher('swSumBy', sumBys, 'showCitations','Citace: '))

          //Legend = selecting institution type
          controls.append($('<div />', {
              id: 'legendDiv'
          }))

          //Container for the treemap
          chartcontainer.append($('<div />', {
              id: 'svgcontainer',
              width:width+2*svgmargin,
              height:height+svgmargin
          }))
          footnote = $('<div />', {class:'footnote',width:width})
          footnote.html('Zdroj: PATSTAT; Pozn.: Do analýzy jsou zařazeny patenty zaznamenaná v databází PATSTAT (Spring 2016 edition) z období 2000-2016 (data za roky 2014-2016 jsou neúplná z důvodu zpoždění patentových statistik). Zobrazeny jsou organizace se sídlem na území Česka. Rozlišujeme čtyři sektory. Stáhněte si podkladová <a class="modalLink" onclick="showModal(\'modDataOrganizace\')">data za organizace</a> anebo <a class="modalLink" onclick="showModal(\'modDataPatenty\')">data za nejcitovanější patenty</a>.</div>')
          chartcontainer.append(footnote)
          
          //Main function for drawing the treemap and legend
          DrawChart()

      };

      function generateSwitcher(mainid, values, funcname,pretext) {
          ids = Object.keys(values);
          switcher = $('<span />', {
              id: mainid,
              class: 'switcher'
          });
          switcher.append('<span class="pretext">' + pretext + '</span>')
          for (i in ids) {
              span = $('<span />', {
                  id: 'sw' + ids[i],
                  class: 'switchCol',
                  onclick: funcname + "('" + ids[i] + "')"
              });
              span.html(values[ids[i]]);
              if (i == 0) {
                  span.addClass('switchActive');
              }
              switcher.append(span);
          }
          return switcher;
      }

      function DrawChart() {

          //Setting the attributes of the chart container (svgcontainer)
          GenerateStatics();

          //Drawing the legend
          DrawLegend();

          //Drawing the treemap
          DrawData();

      };

      function GenerateStatics() {
          parentselector = '#svgcontainer'
          svg = d3.select(parentselector)
              .append('svg')
              .attr('id', 'chartsvg')
              .attr('width', width + 2*svgmargin)
              .attr('height', height+svgmargin);

          color = d3.scaleOrdinal(d3.schemeCategory10)
          t = d3.transition()
              .duration(400)
              .ease(d3.easeLinear);

          treemap = d3.treemap()
              .tile(d3.treemapResquarify)
              .size([width, height])
              .round(true)
              .paddingInner(1.5);
      }
      function ShadeLegend(newShown) {
        d3.selectAll('#legendSvg .legItem')
            .classed('legendPassive', function(d) {
                    if(newShown.includes(d.id)) {
                        return false
                    } else {
                        return true
                    }
                }
            )
    }

      function DrawLegend() {
        distances = [30,130,260,430].map(x=> x * (width/757.8))

          var svg = d3.select("#legendDiv")
              .append("svg")
              .attr("width", width)
              .attr("height", 30)
              .attr('class', 'legend')
              .attr('id', 'legendSvg')

              svg.append('g')
                .attr('transform','translate(10,0)')
                .append('text')
                .text('Zobrazit: ')
                .attr('dy','.85em')
                .classed('pretext',true);

          g = svg.selectAll('.legItem')
              .data(legendTexts)
              .enter()
              .append('g')
              .classed('legItem',true)
              .attr('id',function(d) {return d.id})
              .attr('transform', function (d, i) {
                  return 'translate(' + (50 + distances[i]) + ',0)'
              })
              .on('click', function (d) {
                  ChangeInstType(d);
                  $(this).toggleClass('legendPassive')
              });

          g.append('rect')
              .attr('width', 15)
              .attr('height', 15)
              .style("fill", function (d) {
                  return color(d.id);
              })

          g.append('text')
              .attr("x", 30)
              .attr('dy', '.85em')
              .text(function (d, i) {
                  return d.name;
              })
      };

      //Function used in DrawData() to filter data displayed in the treemap based on the selected institution type and also TOP filtering
      function filterData(data) {
          result = {
              name: 'patents', //name of the js variable containing data in data_ch2.js
              children: []
          }

          for (idx in data.children) {
              subnode = data.children[idx]

              if (selectedInstTypes.includes(subnode.kategorie)) {
                  result.children.push(subnode)
              }
          }


          if (filterInst !== 'All') {
              function compare(a, b) {
                  if (a[sumBy] < b[sumBy])
                      return 1;
                  if (a[sumBy] > b[sumBy])
                      return -1;
                  return 0;
              }
              result.children = result.children.sort(compare)
              var numberOfElems = parseInt(filterInst.substring(3))
              result.children = result.children.slice(0, numberOfElems)
          }
          return result;
      }

      //Function used in the select; when user chooses the institution type, treemap redraws according to the selected type(s)
      function ChangeInstType(d) {
          if (selectedInstTypes.includes(d.id)) {
              index = selectedInstTypes.indexOf(d.id);
              selectedInstTypes.splice(index, 1)
          } else {
              selectedInstTypes.push(d.id)
          }
          //After institution type(s) selected, we can (re)draw the treemap
          DrawTransition()
      }


      function DrawTransition() {
          if (selectedInstTypes.length > 0) {
            sortedData = filterData(patents)
            root.sum(sumBySize)
            
            treemap(root);
            var cell = svg.selectAll('.cell')
            cell.transition()
                .duration(750)
                .attr("transform", function (d) {
                    return "translate(" + d.x0 + "," + d.y0 + ")";
                })
                .select("rect")
                .attr("width", function (d) {
                    return d.x1 - d.x0;
                })
                .attr("height", function (d) {
                    return d.y1 - d.y0;
                });
                cell.select('text')
                // .attr("y", function (d, i) {
                //     return (d.y1 - d.y0) / 2;
                // })
                // .attr("x", function (d, i) {
                //     return (d.x1 - d.x0) / 2;
                // })
                .attr('pointer-events', 'none')
                .style("text-anchor", "middle")
                //Do not display institutions names if their corresponding rectangle is too small
                .attr("class", 
                    function (d) {
                    if ((d.y1 - d.y0 > 40 || d.x1 - d.x0 > 40) && selectedInstTypes.includes(d.data.kategorie)) {
                        return "opacityOne";
                    } else {
                        return "opacityZero";
                    }
                
                 });
                 //.on('end',function() {
                    cell.select('text').html(function(d)  {
                        return myWrapper(d.data.name,d.x1 - d.x0,d.y1 -d.y0)
                     })
                //});
                
                //  cell.html(function(d)  {
                //     return myWrapper(d.data.name,d.x1 - d.x0,d.y1 -d.y0)
                //  })
                // .each('end',function() {
                //     d3.select(this).html(function (d) {
                //         return myWrapper(d.data.name,d.x1 - d.x0,d.y1 -d.y0)
                //     })
                // });
        }
    }

      


      //Main function drawing the treemap
      function DrawTransition2() {
        data = filterData(patents);

        root.sum(sumBySize);
        treemap(root);

        function draw(cells) {
            cells
                .attr("transform", function (d) {
                    return "translate(" + d.x0 + "," + d.y0 + ")";
                });
            cells.select('rect')
                .attr("width", function (d) {
                    return d.x1 - d.x0;
                })
                .attr("height", function (d) {
                    return d.y1 - d.y0;
                })


        }

        var cells = svg.selectAll('.cell')
                        .data(root.leaves(),function(d,i) {return i;});
        var entered = cells.enter()
                        .append('g')
                        .attr("id", function (d) {
                            return d.data.name.replace(/ /g, '_');
                        }).attr('class','cell')
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);
                entered.append('rect')
                    .attr("fill", function (d) {
                        return color(d.data.kategorie);
                    });
                entered.append("text")
                    //  .attr("clip-path", function(d) { return "url(#clip-" + d.data.name + ")"; })
                    .text(function (d) {
                        return d.data.name
                    })
                    // .attr("y", function (d, i) {
                    //     return (d.y1 - d.y0) / 2;
                    // })
                    // .attr("x", function (d, i) {
                    //     return (d.x1 - d.x0) / 2;
                    // })
                    .attr('pointer-events', 'none')
                    .style("text-anchor", "middle")
                    //Do not display institutions names if their corresponding rectangle is too small
                    .attr("class", function (d) {
                        if (d.y1 - d.y0 > 40 || d.x1 - d.x0 > 40) {
                            return "opacityOne"
                        } else {
                            return "opacityZero"
                        }
                    })
                    //Function securing adjusted displaying of the institution name in the rect
                    .each(wordWrap);

                    entered.transition().call(draw);

            updated = cells.transition().call(draw)

            exited = cells.exit()
                    .transition()
                    .select('rect')
                    .attr('width',0)
                    .attr('height',0)
                    .remove();
  

                    //.on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });
      
      }

      function DrawData() {
          d3.select('#chartsvg').remove()
          svg = d3.select(parentselector).append('svg')
              .attr('id', 'chartsvg')
              .attr('width', width + (svgmargin*2))
              .attr('height', height+svgmargin);

          maingroup = svg.append('g').attr('transform','translate('+svgmargin+',0)')
          //draw the treemap only if some institution type is selected in the legend
          if (selectedInstTypes.length > 0) {
              //Use only the data fitered out according to selected institution types
              data = filterData(patents, selectedInstTypes)
              //Set the hierarchy of the treemap
              root = d3.hierarchy(data)
                  .eachBefore(function (d) {
                      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
                  })
                  .sum(sumBySize)
                  
                  .sort(function (a, b) {
                      return b.height - a.height || b.value - a.value;
                  });
              treemap.tile(d3.treemapResquarify.ratio(2));
              treemap(root);
              var cell = maingroup.selectAll("g")
                  .data(root.leaves())
                  .enter().append("g")
                  .attr("transform", function (d) {
                      return "translate(" + d.x0 + "," + d.y0 + ")";
                  })
                  .attr("id", function (d) {
                      return d.data.name.replace(/ /g, '_');
                  }).attr('class','cell')
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut);
              //.on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });

              cell.append("rect")
                  .attr("width", function (d) {
                      return d.x1 - d.x0;
                  })
                  .attr("height", function (d) {
                      return d.y1 - d.y0;
                  })
                  .attr("fill", function (d) {
                      return color(d.data.kategorie);
                  });

              cell.append("text")
                  //  .attr("clip-path", function(d) { return "url(#clip-" + d.data.name + ")"; })
                  .html(function (d) {
                      return myWrapper(d.data.name,d.x1 - d.x0,d.y1 - d.y0)
                  })
                //   .attr("y", function (d, i) {
                //       return (d.y1 - d.y0) / 2;
                //   })
                //   .attr("x", function (d, i) {
                //       return (d.x1 - d.x0) / 2;
                //   })
                  .attr('pointer-events', 'none')
                  .style("text-anchor", "middle")
                  //Do not display institutions names if their corresponding rectangle is too small
                  .attr("class", function (d) {
                      if (d.y1 - d.y0 > 40 || d.x1 - d.x0 > 40) {
                          return "opacityOne"
                      } else {
                          return "opacityZero"
                      }
                  });
          } //the end of if selectedInstTypes>0

      } //the end of DrawData()

      function myWrapper(text,elw,elh) {
          if (text === 'ÚSTAV ORGANICKÉ CHEMIE A BIOCHEMIE AV ČR') {
              console.log()
          }
          const letter = 6; //average length of a letter in pixels
          const row = 11; //average height of row
          const margin_w = 10; //width margin of a cell (left + right)
          const margin_h = 10; //height margin of a cell (top + bottom)
        
          const maxletters = Math.floor((elw - margin_w)/letter);
          const maxrows = Math.floor((elh - margin_h)/row);

          const letters = text.length;
          const words = text.split(' ');
          
          let result = [];

          let rows = 0;
          loopLines:
          do {
            let line = [];
            let letInRow = 0;
            loopWords:
            do {
                word_candidate = words[0]
                if ((letInRow + word_candidate.length) <= maxletters) {
                    let word = words.shift()
                    line.push(word + ' ')
                    letInRow += word.length
                } else {
                    if(word_candidate.length > maxletters) {
                        line.push(word_candidate.substring(0,maxletters) + '-')
                        words[0] = word_candidate.substring(maxletters)
                        break loopWords;
                    } else {
                        break loopWords;
                    }
                }
            } while ((letInRow <= maxletters) && (words.length != 0) )
            result.push(line.join(' '))
            rows += 1
        } while ((rows <= maxrows) && (words.length != 0))
          
        let minHeight = (elh/2)-((row/2)*result.length)
        return result.map((x,i) => '<tspan x="' +elw/2+'" y="'+ (minHeight + (i+1)*row) + '">'+x.trim()+'</tspan>').join('')
    }

    //Function for highlighting the institution selected in the select
      function changeSearchDDL() {
          val = $('#ddlSearch').val();
          dmenu = menudata.find(x => x.id == val)
          if (dmenu.displayed) {
              sel = d3.select('#' + dmenu.text.replace(/ /g, '_'))
              el = sel._groups[0][0]
              d = sel.data()[0]
              showDetails(d.data, true, el,d.x1 - d.x0,d.y1 - d.y0);
          } else {
            hack = svg.append('g')
                .attr('id','hack')
                .attr('transform','translate(' + (width + svgmargin) + ',0)');
            hack.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", color(dmenu.kategorie));
                
            hack.append('text')
                .attr('x',20)
                .attr('y',20)
                .style('text-anchor','middle');
              
            showDetails(dmenu, true, d3.select('#hack')._groups[0][0],10,10);
        }
      }


      //Function determining the size of rectangles based on number of citations
      function sumBySize(d) {
            if (selectedInstTypes.includes(d.kategorie)) {
                return d[sumBy];
            } else {
                return 0;
            }
      }

      function showDetails(d, keepOpen, el,w,h) {
          var g = d3.select(el) //.attr(id)
          g.raise()
          var rect = g.select('rect');
          //text = g.select('text');
          //title = g.select('title');

          // w = d.x1 - d.x0 //rect.attr('width');
          // h = d.y1 - d.y0 //rect.attr("height");
          //ratio = w/h
          if (w < 100) {
              w = 100
              // h = w/ratio
          }

          if (h < 100) {
              h = 100
          }

          rect.attr('fill', d3.interpolateRgb(color(d.kategorie), '#FFFFFF')(0.5))
          rect.transition()
            .attr("width", w * 1.2)
            .attr("height", h * 1.2)
            .on("end", function () {
              g.select('text')
                  .html('<tspan x="' + w / 2 + '" dy="1.2em" class="boldtext">' + d.name + '</tspan><tspan x="' + w / 2 + '" dy="1.2em">IČO: ' + d.ico + '</tspan><tspan x="' + w / 2 + '" dy="1.2em">Citací: ' + d.citations_All + ',</tspan><tspan x="' + w / 2 + '" dy="1.2em"> z Česka: ' + d.citations_CZ + '</tspan><tspan x="' + w / 2 + '" dy="1.2em"> Patentů: ' + d.patents + '</tspan>')
                  .attr("y", h / 5)
                  .classed('opacityZero', false);
              //.attr("x", w / 2)
              //.style('text-anchor','start');

              if (keepOpen) {
                  g.classed('keepOpen',true)
                  g.on('mouseover', function () {})
                  g.on('mouseout', function () {})

                  g.append('text')
                      .text('[-]')
                      .attr('x', 0.95 * w)
                      .attr('y', .15 * h)
                      .style('cursor', 'pointer')
                      .classed('closing', true)
                      .on('click', function () {
                          hideDetailBox(d.ico)
                      });
              }

          });

      }

      //Mouse handlers for highlighting the hovered institution rect
      function handleMouseOver(d, i) {
          showDetails(d.data, false, this,d.x1 - d.x0,d.y1 - d.y0)
      }

      function hideDetailBox(ico) {
          dmenu = menudata.find(x => x.id == ico)

          sel = d3.select('#' + dmenu.text.replace(/ /g, '_'))
          el = sel._groups[0][0]
          d = sel.data()[0]

          hideDetails(d, true, el);
      }

      function hideDetails(d, keepOpen, el) {
          var g = d3.select(el)
          var rect = g.select('rect');
          if (keepOpen) {
            g.on('mouseover', handleMouseOver)
            g.on('mouseout', handleMouseOut)

            g.select('.closing').remove();
        }
          if (typeof d === 'undefined') {
              d3.selectAll('#hack').transition().attr('width',1).attr('height',1).on('end',function() {$('#hack').remove()})
          } else {
          rect.attr('fill', color(d.data.kategorie))
          rect.transition().attr("width", d.x1 - d.x0).attr("height", d.y1 - d.y0).on('end', function() {
              g.select('text')
              .html(myWrapper(d.data.name,d.x1 - d.x0,d.y1-d.y0))
              .attr("y", (d.y1 - d.y0) / 2)
              .attr("x", (d.x1 - d.x0) / 2)
              .classed('opacityZero', function (d) {
                  if((d.x1 - d.x0) < 40||(d.y1 - d.y0) < 40) {
                    return true;
                  } else {
                      return false;
                  }
              });
          })
        }
      }

      function handleMouseOut(d, i) {
          hideDetails(d, false, this)
      }
      //Function for potential use
      //determines if white or black will be better contrasting color
      function getContrast50(hexcolor) {
          return (parseInt(hexcolor.replace('#', ''), 16) > 0xffffff / 3) ? 'black' : 'white';
      }

      function showCitations(variable) {
          $('#swSumBy .switchActive').removeClass('switchActive');
          switchEl = $('#swSumBy #sw' + variable).addClass('switchActive');

          sumBy = 'citations_' + variable;
          DrawTransition();
      }

      function filterInstitutions(variable) {
          $('#swFilters .switchActive').removeClass('switchActive');
          switchEl = $('#swFilters #sw' + variable).addClass('switchActive');

          filterInst = variable;
          DrawData();
      }