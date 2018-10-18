var weblink = 'https://ideaapps.cerge-ei.cz/PredatoriMistni/' //TODO smaz az budu znat adresu!!!!
var bitly = 'https://bit.ly/2s4oahD'
var webtitle = "Kde se nejvíce publikuje v predátorských a místních časopisech?";


var orgs = [],insts = [], includedInsts = [];

function sortMenudata() {
    for (var org in menudata) {
        o = menudata[org]
         if (o.level === 0) {
             orgs.push(o.id);
         }
         else {
             insts.push(org)
             if(o.included === "True") {
                 includedInsts.push(o.id);
             }
         }
    }
}

// Generating Dropdown-list
function createSelect2(selector) {
    controls = $('<div />').addClass('controls')
    select = $('<select />', {id:'ddlSearch',class:'form-control',onchange: "ddlChange('" + selector + "')"});
    select.append('<option />')
    controls.append(select)

    controls.append($('<a id="rstBtn" class="button buttonPassive" onclick="Redraw(\''+selector  +'\',true,true)">Obnovit</a>'));
    $(selector).append(controls);

    function formatResult(node) {

        function checkvisib(node) {
            var istype = true;
            var isfield = true;
            if (node.level == 0) {//Is Org
                if (data['#mainApp'].used.types.indexOf(node.Type) != -1){
                    istype = true;
                } else {
                    istype = false;
                }
            } else { //Is institution
                if (data['#mainApp'].used.types.indexOf(node.Type) != -1){
                    istype = true;
                } else {
                    istype = false;
                }
    
                if (data['#mainApp'].used.fields.indexOf(node.Field) != -1){
                    isfield = true;
                } else {
                    isfield = false;
                }
            }

            if (istype && isfield) {
                return true;
            }
            else {
                return false;
            }
    
        }
        var visible = checkvisib(node);
        scolor = (visible) ? 'ddlvisible' : 'ddlunvisible' 
        s= '<span style="padding-left:' + (20 * node.level) + 'px;" class="' + scolor + '">' + node.text + '</span>'
      var $result = $(s);
      return $result;
    };

    $(selector + ' #ddlSearch').select2({
      placeholder: {id:'',text: 'Vyhledejte pracoviště či organizaci ...'},
      allowClear: false,
      width: sizes.chart.width - 90,
      data: menudata,
      formatSelection: function(item) {
          return item.text
      },
      formatResult: function(item) {
          return item.text
      },
        templateResult: formatResult
    });

    return $(selector);
}

function toggleLegendClick(input,legtype,el) {
    selector = '#' + $(el).parent().parent().parent().parent().parent().parent().attr('id')

    if (data[selector].used[legtype].indexOf(input) != -1) {
        data[selector].used[legtype] = data[selector].used[legtype].filter(function(e) {return e != input; });//e => e != input);
    }
    else {
        data[selector].used[legtype].push(input)
    }
    DrawData(selector);
    $(selector + ' #rstBtn').addClass('buttonActive')

}


function ddlChange(selector) {
    var id  = $(selector + ' #ddlSearch').select2('val');
    unselectAll(selector);
    var anythingSelected = (id !== '') ? true : false;

    if (anythingSelected) {
        var IsOrg = (orgs.indexOf(id) != -1) ? true : false;
        $(selector + ' #rstBtn').addClass('buttonActive')
        if (IsOrg) {
            listinst = $.map(data[selector].institutions,function(el) {return el;});
            ds = listinst.filter(function(d) {return d.Predkladatel_short === id;});//d => d.Predkladatel_short === id);

            $.each(ds,function(key,value)
                {
                    value.selected = 1;
                });
            descBoxOrg( $(selector + ' #ddlSearch').select2('data')[0].text)
        }
         else {
            if(includedInsts.indexOf(id) != -1) {
                d = data[selector].institutions[id];
                d.selected = 1;
                openDescBox(selector,d,true);
            }else {
                d = excludedInsts[id];
                openDescBox(selector,d,false);
            }
        }
    }
    else {
        descBoxDefault()
        $(selector + ' #rstBtn').removeClass('buttonActive')

    }
    DrawData(selector);
};

function unselectAll(selector) {
    $.each(data[selector].institutions,function(key,value)
        {
            value.selected = 0;
        })
}

function SelectSinglePoint(selector, d) {
    if (d.selected === 1) {
        $(selector + ' #ddlSearch').val('').change()
    } else{
        $(selector + ' #ddlSearch').val(d.ID).change()
    }  
    
}

function openDescBox(selector,d,IsAvailable){
    // IsAvailable = IsAvailable 
    div = $('#descbox')
    div.hide();
    div.empty();
    if (IsAvailable) {
        div = descBoxData(div,d);
    }
    else {
        div = descBoxNA(div,d);
    }
    div.fadeIn('fast');
}

function descBoxData(div,d) {
    div = div.append('<p><strong>' + d.Jednotka_name + '</strong> (' + d.Predkladatel_long + ')</p>')
    div = div.append('<p>V letech 2011 - 2015 celkem ' + d.Total + ' článků indexovaných ve Scopusu. Z toho ' + d.Predatory + ' v predátorských a ' + d.Czech + ' v místních časopisech.</p>')
    div = div.append('<p>Stáhněte si seznam článků v <a href="xls/'+ d.JEDNOTKA +'_Predatory.xlsx">predátorských</a> a <a href="xls/'+ d.JEDNOTKA +'_Local.xlsx">místních</a> časopisech nebo <a href="xls/'+ d.JEDNOTKA +'_All.xlsx">všech</a> článků.</p>')     
    div = div.append('<div id="closedescbox" onclick="closeBox(\'#mainApp\')">[-]</div>')
    return div
}

function descBoxNA(div) {
    div = div.append('<p><strong>' + d.Jednotka_name + '</strong> (' + d.Predkladatel_long + ')</p>')
    div = div.append('<p>Pro toto pracoviště není k dispozici dostatečný počet relevantních výsledků a proto do analýzy nebylo zařazeno.</p>')
    div = div.append('<div id="closedescbox" onclick="closeBox(\'#mainApp\')">[-]</div>')

    return div
}

function descBoxOrg(org) {
    div = $('#descbox')
    div.hide();
    div.empty();

    div = div.append('<p><strong>' + org + '</strong></p>')
    div = div.append('<div id="closedescbox" onclick="closeBox(\'#mainApp\')">[-]</div>')

    div.fadeIn('fast');

}

function descBoxDefault() {
    div = $('#descbox')
    div.hide();
    div.empty();
    div.append('<p>Kliknutím na legendu <strong>zobrazíte či skryjete</strong> různé obory a typy pracovišť</p>')
    div.append('<p>Pro podrobnosti <strong>klikněte</strong> na jednotlivý bod či <strong>vyhledejte</strong> konkrétní pracoviště podle názvu v roletkovém menu nad grafem.</p>')
    div.append('<p>Po vybrání konkrétního pracoviště si budete moci <strong>stáhnout</strong> seznam článků v predátorských a místních časopisech.</p>')

    div.fadeIn('fast')
}

function closeBox(selector) {
    $(selector + ' #ddlSearch').val('').change();
}


function showCopyLink() {
    $('#myurl').val(weblink);
    showModal('modCopyLink')
    //copyLink();
}

function copyLink(copyinput,linkspan) {
    $('#' + linkspan).hide();
    /* Get the text field */
    var copyText = document.getElementById(copyinput);

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");

    $('#' +linkspan).fadeIn();
}

function shareLinks() {
    //link = window.location.href;
    
    
    //Facebook
    $('#fb').attr('href',"https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(weblink));

    //Twitter
    $('#tw').attr('href',"https://twitter.com/intent/tweet?text=" + encodeURI(webtitle + ' ' + bitly) );

    //LinkedIn
    $('#li').attr('href',"http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURI(weblink) + "&title=" + encodeURI(webtitle))

    $('#mail').attr('href',"mailto:?subject="+ encodeURIComponent(webtitle) + "&body=" + encodeURIComponent(weblink) )
}