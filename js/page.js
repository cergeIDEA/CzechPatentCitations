var sizes = {}

var waypoints;


function loadJS() {

    //sortMenudata();
            
    //getSizes();

    DrawAllCharts();

    waypoints = waypointing();

    checkResolution();

    //$('.whitebox').css('left',sizes.chart.width - 350)

    shareLinks();

}

function checkResolution() {
    w = $(window).width()
    if (w<999) {
        $('#myurl2').val(weblink);
        showModal('modRozliseni');
        $('#modalWrap').off('click');
    }
}

function waypointing() {
    function activatefix(selector) {
        $('.fixactive').removeClass('fixactive');
        $(selector).addClass('fixactive');
    };

    function fixBox(selector,parent,target,toppos) {
        element = $(parent+ ' ' +selector).detach();
        $(target).append(element)
        $(target  + ' ' + selector).css({top:toppos,'box-shadow':'0 0 0 0'})
    }

    function floatBox(selector,parent,target) {
        element = $(parent + ' ' + selector).detach();
        $(target).append(element)
        $(element).css({top:'0px','box-shadow': '0px 0px 20px 4px #d1d4d3'})
    }
    
    // fixing menu and adding shadow 
    waypoints = $('#menu').waypoint(function(direction) {
        if(direction === 'down') {
            $('#everything').append($('<div class="stickyshadow"></div>'));
            $('#menu').addClass('sticky');
            $('#menu').removeClass('floaty');
            $('#menuempty').css('display','block')
        } else {
            $('#menu').addClass('floaty');
            $('#menu').removeClass('sticky');
            $('#menuempty').css('display','none')
            $('.stickyshadow').remove();
        }});

    // MENU INTERACTIONS        
    waypoints = $('#ProcSledovat').waypoint({handler:function(direction) {
                if (direction === 'down') {
                    $('#mProcSledovat').addClass('storyPast')
                } else {
                    $('#mProcSledovat').removeClass('storyPast')
                }},offset:'17%'});


    waypoints = $('#ProcSledovat').waypoint(function(direction) {
        if (direction === 'down') {
            activatefix('#app')
        } else {
            activatefix('#intro')
        }});
            
    waypoints = $('#empt-app').waypoint({handler:function(direction) {
        if (direction === 'down') {
            $('#mapp').addClass('storyPast')
        } else {
            $('#mapp').removeClass('storyPast')
        }},offset:'17%'});


    waypoints = $('#VyzkumOrg').waypoint(function(direction) {
        if(direction === 'down') {
            $('#mVyzkumOrg').addClass('storyPast')
        } else {
            $('#mVyzkumOrg').removeClass('storyPast')
        }
    },
     {offset:'17%'}
    );

    waypoints = $('#Podniky').waypoint(function(direction) {
        if(direction === 'down') {
            $('#mPodniky').addClass('storyPast')
        } else {
            $('#mPodniky').removeClass('storyPast')
        }
    },
     {offset:'17%'}
    );

    waypoints = $('#conclusion').waypoint({handler:function(direction) {
        if (direction === 'down') {
            $('#mConclusion').addClass('storyPast')
        } else {
            $('#mConclusion').removeClass('storyPast')
        }},offset:'17%'});


    // CHART INTERACTIONS
    waypoints = $('#VyzkumOrg').waypoint(function(direction) {
        if(direction === 'down') {

            //Institution type
            selectedInstTypes = ['avcr','vvs','ovo'];
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
            
        } else {
            selectedInstTypes = InstTypes;
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
        }
    },
     {offset:'60%'}
    );

    waypoints = $('#Podniky').waypoint({handler:function(direction) {
        if(direction === 'down') {
            selectedInstTypes = ['podnik'];
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
        } else {
            selectedInstTypes = ['avcr','vvs','ovo'];
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
        }
    },offset:'60%'}    );

    waypoints = $('#conclusion').waypoint({handler:function(direction) {
        if(direction === 'down') {
            selectedInstTypes = InstTypes;
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
        } else {
            selectedInstTypes = ['podnik'];
            ShadeLegend(selectedInstTypes);

            // Sum By
            sumBy = 'citations_All';
            $('#swFilters .switchActive').removeClass('switchActive');
            $('#swFilters #swAll').addClass('switchActive')

            //FilterInst
            filterInst = 'All'
            $('#swSumBy .switchActive').removeClass('switchActive');
            $('#swSumBy #swAll').addClass('switchActive')

            //Draw
            DrawTransition();
        }
    },offset:'0%'}    );


    return waypoints;
};

function getSizes() {
    sizes.screen = {};
    sizes.screen.height = $('.fullscreen').height();
    sizes.screen.width = $('.fullscreen').width();

    sizes.menu = {};
    sizes.menu.height = $('#menu').height();

    sizes.chart = {};
    sizes.chart.width = (0.7*sizes.screen.height > 500) ? 0.7*sizes.screen.height : 500 ;
    sizes.chart.height = 0.7*sizes.screen.height;// +50;

}

function MoveOn(selector) {
    $('html,body').animate({
        scrollTop: $('#' +selector).offset().top
    })
};


function showModal(modal) {
    if ($('#' + modal).length) {
        $('.modalBackground').fadeIn(200,function() {$('#' + modal).addClass('modalActive')});
    } else {
        alert('THERE IS NO MODAL NAMED ' + modal + '!!!') 
    }
};

function hideModal() {
    $('.modalBackground').fadeOut(200,function() {});
    $('.modalActive').removeClass('modalActive')
};

window.onclick = function(event) {
    modal = document.getElementById('modalWrap')
    if (event.target == modal) {
        id = $('.modalActive').attr('id')
        if(id != 'modRozliseni') {
            hideModal();
        }
    }
}

$(document).keyup(function(e) {
    if (e.keyCode === 27) {
        hideModal()
    }   // esc
  });
  