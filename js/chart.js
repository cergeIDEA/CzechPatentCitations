      //General setup of fundamental variables and function used in the <body onload> (DrawAllCharts)

      var color, svg, width, height, svgmargin, t, treemap, parentselector, root, sortedData,maingroup;

      var sumBys = {
          All: 'Všechny',
          CZ: 'Domácí',
          INT: 'Zahraniční'
      };
      var sumBy = 'citations_All';

      var filters = {
          All: "Všechny",
          top100: "Nej 100",
          top50: "Nej 50"
          //top20: "Prvních 20"
      };

      var periods = {
        All: "Všechny",
        y00_06: "2000-06",
        y07_14: "2007-14"
      };
      var selPeriod = 'All';
      
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
          footheight = 140
          height = ($(window).height() * 0.85) - footheight;
          //width = Math.min($(window).width() * 0.6, 880) //no chart margin
          width = Math.min(Math.max($(window).width() * 0.6,800),1000)
          svgmargin = 120

          chartcontainer = $('#app .chartcontainer')
          //Container for controls = select + legend
          controls = $('<div />', {
              id: 'controls',
              width: width
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
              if (data.text.indexOf(params.term.toUpperCase()) > -1) {
                  var modifiedData = $.extend({}, data, true);

                  // You can return modified objects from here
                  // This includes matching the `children` how you want in nested data sets
                  return modifiedData;
              }
              if (typeof data.ico !== 'undefined') {
                  if (data.ico.toString().indexOf(params.term.toUpperCase()) > -1) {
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

          function formatSelect2(node) {
            scolor = (node.displayed) ? 'ddlvisible' : 'ddlunvisible'

            if ((filterInst !== 'All') || (selPeriod !== 'All')) {
                if (typeof node.ico !== 'undefined') {

                    if ($('#ico'+node.ico).length == 0) {
                        scolor = 'ddlunvisible';
                    }
                    else {
                        console.log()
                    }
                }
            }

              span = '<span class="' + scolor + '">'+ node.text +'</span>'

              return $(span)
          }

          $('#ddlSearch').on('change', changeSearchDDL)
          $('#ddlSearch').select2({
              data: menudata[selPeriod],
              width: width - title.outerWidth() - svgmargin,
              allowClear: true,
              matcher: matchCustom,
              multiple: false,
              placeholder: 'Vyhledejte organizaci či IČO...',
              templateResult:formatSelect2
          });
          //Reset buttion for select
          //controls.append($('<a id="rstBtn" class="button buttonPassive" onclick="Redraw((),true,true)">Obnovit</a>'));

          switchers = $('<div />', {
              id: 'switchers'
          })
          controls.append(switchers)

          // Generate Filtering switcher
          switchers.append(generateSwitcher('swFilters', filters, 'filterInstitutions', 'Organizace: '))

          // Generate years switcher
          switchers.append(generateSwitcher('swYears', periods, 'filterYears', 'Roky: '))


          //Generate Citations switcher
          switchers.append(generateSwitcher('swSumBy', sumBys, 'showCitations', 'Citace: '))

          //Legend = selecting institution type
          controls.append($('<div />', {
              id: 'legendDiv'
          }))

          //Container for the treemap
          chartcontainer.append($('<div />', {
              id: 'svgcontainer',
              width: width + 2 * svgmargin,
              height: height + svgmargin
          }))
          footnote = $('<div />', {
              class: 'footnote',
              width: width,
              //style: 'top: -' + footheight + 'px'
          })
          footnote.html('Pozn.: Do analýzy jsou zařazeny žádosti o patent zaznamenané v databázi <a class="modalLink"  onclick="showModal(\'modPatstat\')">PATSTAT</a> (Spring 2016 edition) od roku 2000. Zobrazeny jsou <a class="modalLink" onclick="showModal(\'modOrganizace\')">organizace</a> se sídlem na území Česka. Rozlišujeme čtyři <a class="modalLink" onclick="showModal(\'modSektory\')">sektory</a>. Stáhněte si podkladová <a class="modalLink" href="xls/DataOrganizace.xlsx" >data za organizace</a> anebo <a class="modalLink" href="xls/NejcitovanejsiPatenty.xlsx">data za nejcitovanější patenty</a>. Zdroj: Vlastní výpočty na základě <a class="modalLink"  onclick="showModal(\'modPatstat\')">PATSTAT</a>.</div>')
          chartcontainer.append(footnote)

          //Main function for drawing the treemap and legend
          DrawChart()

      };

      function generateSwitcher(mainid, values, funcname, pretext) {
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
              .attr('width', width + 2 * svgmargin)
              .attr('height', height + svgmargin);

          color = d3.scaleOrdinal(d3.schemeCategory10)
          t = d3.transition()
              .duration(400)
              .ease(d3.easeLinear);

          treemap = d3.treemap()
              .tile(d3.treemapResquarify.ratio(2))
              .size([width, height])
              .round(true)
              .paddingInner(1.5);
      }

      function ShadeLegend(newShown) {
          d3.selectAll('#legendSvg .legItem')
              .classed('legendPassive', function (d) {
                  if (newShown.includes(d.id)) {
                      return false
                  } else {
                      return true
                  }
              })
      }

      function DrawLegend() {
          distances = [0, 100, 250, 450].map(x => x * (width / 757.8))

          var svg = d3.select("#legendDiv")
              .append("svg")
              .attr("width", width)
              .attr("height", 25)
              .attr('class', 'legend')
              .attr('id', 'legendSvg')

        //   svg.append('g')
        //       .attr('transform', 'translate(10,0)')
        //       .append('text')
        //       .text('Zobrazit: ')
        //       .attr('dy', '.85em')
        //       .classed('pretext', true);

          g = svg.selectAll('.legItem')
              .data(legendTexts)
              .enter()
              .append('g')
              .classed('legItem', true)
              .attr('id', function (d) {
                  return d.id
              })
              .attr('transform', function (d, i) {
                  return 'translate(' + (10 + distances[i]) + ',5)'
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

          for (idx in data[selPeriod].children) {
              subnode = data[selPeriod].children[idx]

              if (selectedInstTypes.includes(subnode.kategorie)) {
                  if (subnode[sumBy] > 0) {
                    result.children.push(subnode)
                  }
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
        $('#ddlSearch').val('').change()

          if (selectedInstTypes.length > 0) {
            data = filterData(patents, selectedInstTypes)

            root = d3.hierarchy(data)
            .eachBefore(function (d) {
                d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
            })
            .sum(sumBySize)

            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value;
            });

              treemap(root);

              //generate new cells
            var cell = maingroup.selectAll('.cell')
                .data(root.leaves());
                
            var newg = cell.enter().append("g")
                .attr("transform", function (d) {
                    return "translate(" + width + "," + height + ")";
                })
                .attr('class','cell')
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);

                newg.append("rect")
                .attr("width",0)
                .attr("height",0);

                newg.append("text")
                .attr('pointer-events', 'none')
                .style("text-anchor", "middle");
    
            all = maingroup.selectAll('.cell')
            all.attr("id", function (d) {
                return 'ico'+ d.data.ico;//name.replace(/ /g, '_');
            }).attr('class', 'cell');

            all.select('rect').attr("fill", function (d) {
                return color(d.data.kategorie);
            })


            all.select('text').html(function (d) {
                return myWrapper(d.data.name, d.x1 - d.x0, d.y1 - d.y0, d.data.kategorie)
            });

            maingroup.selectAll('.cell').transition()
                  .duration(500)
                  .attr("transform", function (d) {
                      return "translate(" + d.x0 + "," + d.y0 + ")";
                  })
                  .select("rect")
                  .attr("width", function (d) {
                      return d.x1 - d.x0;
                  })
                  .attr("height", function (d) {
                      return d.y1 - d.y0;
                  })
                  .on('end', function() {
    
                  });


            cell.exit().remove();

          }
      }




      function DrawData() {
          d3.select('#chartsvg').remove()
          svg = d3.select(parentselector).append('svg')
              .attr('id', 'chartsvg')
              .attr('width', width + (svgmargin * 2))
              .attr('height', height + svgmargin);

          maingroup = svg.append('g').attr('transform', 'translate(' + svgmargin + ',0)').attr('id','maingroup')
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
              treemap(root);
              var cell = maingroup.selectAll("g")
                  .data(root.leaves())
                  .enter().append("g")
                  .attr("transform", function (d) {
                      return "translate(" + d.x0 + "," + d.y0 + ")";
                  })
                  .attr("id", function (d) {
                      return 'ico'+ d.data.ico;//name.replace(/ /g, '_');
                  }).attr('class', 'cell')
                  .on("mouseover", handleMouseOver)
                  .on("mouseout", handleMouseOut);

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
                  .html(function (d) {
                      return myWrapper(d.data.name, d.x1 - d.x0, d.y1 - d.y0, d.data.kategorie)
                  })
                  .attr('pointer-events', 'none')
                  .style("text-anchor", "middle")
          }; //the end of if selectedInstTypes>0

      } //the end of DrawData()
      function wrapText(text,elw,elh) {
            const letter = 6; //average length of a letter in pixels
            const row = 11; //average height of row
            const margin_w = 10; //width margin of a cell (left + right)
            const margin_h = 10; //height margin of a cell (top + bottom)

            const maxletters = Math.floor((elw - margin_w) / letter); //maximum letters in a row
            const maxrows = Math.floor((elh - margin_h) / row); // max rows in a cell

            let words = text.split(' ');

            result = [];
            rows=0;
            loopLines: do { 
                let line = [];
                let nextLine = [];
                let letInRow = 0;
                loopWords:
                    do {
                        word_candidate = words[0] 
                        if ((letInRow + word_candidate.length) <= maxletters) {
                            let word = words.shift()
                            line.push(word + ' ')
                            letInRow += word.length
                        } else {
                            if (word_candidate.length > maxletters) {
                                if (letInRow) {
                                    break loopWords;
                                } else {
                                    line.push(word_candidate.substring(0, maxletters) + '-')
                                    words[0] = word_candidate.substring(maxletters)
                                    break loopWords;
                                }
                            } else {
                                let word = words.shift()
                                nextLine.push(word + ' ')
                                letInRow += word.length
    
                                break loopWords;
                            }
                        }
                    } while ((letInRow <= maxletters) && (words.length != 0))
                result.push(line.join(' '))
                if(nextLine.length) {
                    result.push(nextLine.join(' '))
                }
                rows += 1
            } while ((rows <= maxrows) && (words.length != 0))
            return result;
        }

      function myWrapper(text, elw, elh, kategorie) {

          // Only when target cell of certain size and if the category is actually displayed
          if ((elh > 40 || elw > 40) && selectedInstTypes.includes(kategorie)) {
            result = wrapText(text,elw,elh)
          } else {result = [];}
          let minHeight = (elh / 2) - ((11 / 2) * result.length)
          return result.map((x, i) => '<tspan x="' + elw / 2 + '" y="' + (minHeight + (i + 1) * 11) + '">' + x.trim() + '</tspan>').join('')
      }

      //Function for highlighting the institution selected in the select
      function changeSearchDDL() {
        val = $('#ddlSearch').val();
        hideAll();
        if (val !== '') {
            dmenu = menudata[selPeriod].find(x => x.id == val)
            if ($('#ico' + dmenu.ico).length) {
                sel = d3.select('#ico' + dmenu.ico);//text.replace(/ /g, '_'))
                el = sel._groups[0][0]
                d = sel.data()[0]
                showDetails(d.data, true, el, d.x1 - d.x0, d.y1 - d.y0);
            } else {
                hack = maingroup.append('g')
                    .attr('id', 'hack')
                    .attr('transform', 'translate(' + (width + 10) + ',0)');
                hack.append("rect")
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", color(dmenu.kategorie));

                hack.append('text')
                    .attr('x', 20)
                    .attr('y', 20)
                    .style('text-anchor', 'middle');

                showDetails(dmenu, true, d3.select('#hack')._groups[0][0], 10, 10);
            }
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

      function textDetail(d,w,h) {
          newh = Math.max(h * 1.2,120)
          neww = Math.max(w *1.2,120)

        result = wrapText(d.name,neww,newh)
        bolds = result.length;
        result.push('IČO: ' + d.ico)
        result.push('Citací: ' + d.citations_All)
        result.push('domácí: ' + d.citations_CZ)
        result.push('zahraniční: ' + d.citations_INT)
        result.push('Patentů: ' + d['pocet patentu'])

        let minHeight = (newh / 2) - ((11 / 2) * result.length)

        function tspanIt(x,i,minHeight,bolds,w) {
            first ='<tspan x="' + w / 2 + '" y="' + (minHeight + (i + 1) * 11) + '"';
            second =  (i < bolds) ? ' class="boldtext"' :'';
            third =  '>' + x + '</tspan>'
            return first + second + third;
        }
        return result.map((x, i) => tspanIt(x,i,minHeight,bolds,neww)).join('')

        //return '<tspan x="' + w / 2 + '" dy="1.2em" class="boldtext">' + d.name + '</tspan><tspan x="' + w / 2 + '" dy="1.2em">IČO: ' + d.ico + '</tspan><tspan x="' + w / 2 + '" dy="1.2em">Citací: ' + d.citations_All + ',</tspan><tspan x="' + w / 2 + '" dy="1.2em"> z Česka: ' + d.citations_CZ + '</tspan><tspan x="' + w / 2 + '" dy="1.2em"> ze zahraničí: ' + d.citations_INT + '</tspan><tspan x="' + w / 2 + '" dy="1.2em"> Patentů: ' + d.patents + '</tspan>'
      }

      function showDetails(d, keepOpen, el, w, h) {
          var g = d3.select(el) //.attr(id)
          g.raise()
          var rect = g.select('rect');
          if (w < 100) {
              w = 100
          }
          newh = h * 1.2
          if (h < 100) {
              newh = 100 * 1.2
          }

          //hpos = Number(g.attr('transform').slice(10,11))
          rect.attr('fill', d3.interpolateRgb(color(d.kategorie), '#FFFFFF')(0.5))
          g.transition()
            .attr('transform',function(d) {
                if (typeof d !== 'undefined'){
                if (d.y0 < (height - svgmargin)) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
                } else { return  'translate(' + d.x0 +',' + (d.y0 - (newh - h)) + ')';}
            } else {return 'translate(' + (width + 10) + ',0)'} 
        }).select('rect')
              .attr("width", w * 1.2)
              .attr("height", newh)

              .on("end", function () {
                  g.select('text')
                      .html(textDetail(d,w,h))
                      .attr("y", h / 5)
                      .classed('opacityZero', false);

                  if (keepOpen) {
                      g.classed('keepOpen', true)
                      g.on('mouseover', function () {d3.select(this).raise()})
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
          showDetails(d.data, false, this, d.x1 - d.x0, d.y1 - d.y0)
      }
      function hideAll() {
        sel = d3.selectAll('.keepOpen')
        el = sel._groups[0][0]
        d = sel.data()[0]

        hideDetails(d, true, el);

      }
      function hideDetailBox(ico) {
          dmenu = menudata[selPeriod].find(x => x.id == ico)

          sel = d3.select('#ico' + dmenu.ico);//text.replace(/ /g, '_'))
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
              d3.selectAll('#hack rect').transition().attr('width', 1).attr('height', 1).on('end', function () {
                  $('#hack').remove()
              })
          } else {
              rect.attr('fill', color(d.data.kategorie))

              g.transition()
              .attr('transform',function() { return 'translate('+d.x0 +','+ d.y0 + ')';})
              .select('rect')
              .attr("width", d.x1 - d.x0)
              .attr("height", d.y1 - d.y0)
              .on('end', function () {
                  g.select('text')
                      .html(myWrapper(d.data.name, d.x1 - d.x0, d.y1 - d.y0,d.data.kategorie));
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
          DrawTransition();
      }

      function filterYears(variable) {
        $('#swYears .switchActive').removeClass('switchActive');
        switchEl = $('#swYears #sw' + variable).addClass('switchActive');

        selPeriod = variable;
        DrawTransition();
    }