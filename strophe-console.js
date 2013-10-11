var StropheConsole = {
    baseCss:
        '#console{ background: #000;' +
                  'color: #ddd;' +
                  'width: 100%;' +
                  'top: 0px;' +
                  'left: 0px;' +
                  'position: fixed;' +
                  'z-index: 999;' +
                  'display: none;' +
                  'text-align: left; }' +
        '#console-log{ height: 270px;' +
                      'overflow: auto; }' +
        '#console-inputarea{ margin-left: 1%;' +
                            'margin-right: 1%; }' +
        '#console-input{ width: 98%;' +
                        'border-color: #ccc;' +
                        'background-color: #000;' +
                        'color: #eee;' +
                        'position: relative;' +
                        '}' +
        '.xmpp_incoming { background-color: #333; }' +
        '.xml_punc { color: #888; }' +
        '.xml_tag { color: #e77; }' +
        '.xml_aname { color: #55d; }' +
        '.xml_avalue { color: #77f; }' +
        '.xml_text { color: #aaa; }' +
        '.xml_level0 { padding-left: 0; }' +
        '.xml_level1 { padding-left: 1em; }' +
        '.xml_level2 { padding-left: 2em; }' +
        '.xml_level3 { padding-left: 3em; }' +
        '.xml_level4 { padding-left: 4em; }' +
        '.xml_level5 { padding-left: 5em; }' +
        '.xml_level6 { padding-left: 6em; }' +
        '.xml_level7 { padding-left: 7em; }' +
        '.xml_level8 { padding-left: 8em; }' +
        '.xml_level9 { padding-left: 9em; }',
    baseHtml:
        '<div id="console">' +
          '<div id="console-log"></div>' +
          '<div id="console-inputarea">' +
            '<input id="console-input" type="text"/>' +
          '</div>' +
        '</div>',

    init: function(options) {
        $(document).ready(function() {
            $('<style>' + StropheConsole.baseCss + '</style>').appendTo('head');
            $(StropheConsole.baseHtml).appendTo('body');

            StropheConsole.initPlugin(options);

            $(document).keydown(function(evt) {
                evt = evt || window.event;
                // check for tilda
                if (evt.which === 192) {
                    evt.preventDefault();
                    if ($('#console:visible').length == 1) {
                        $('#console').slideUp('fast');
                    } else {
                        $('#console').slideDown('fast');
                    }
                }
            });
        });
    },

    initPlugin: function(options) {
        var debugBosh = options ? options.bosh : false;
        Strophe.addConnectionPlugin(
            'console',
            {
                init: function(conn) {
                    conn.xmlInput = function(body) {
                        StropheConsole.showTraffic(body, 'incoming', debugBosh);
                    };
                    conn.xmlOutput = function(body) {
                        StropheConsole.showTraffic(body, 'outgoing', debugBosh);
                    };
                }
            });
    },

    showTraffic: function(body, type, debugBosh) {
        var console = $('#console-log').get(0);
        var atBottom = console.scrollTop >= console.scrollHeight
                - console.clientHeight;
        if (debugBosh) {
            StropheConsole.addTraffic(body, type);
        } else {
            if (body.childNodes.length > 0) {
                $.each(body.childNodes, function() {
                    StropheConsole.addTraffic(this, type);
                });
            }
        }

        if (atBottom) {
            console.scrollTop = console.scrollHeight;
        }
    },

    addTraffic: function(msg, type) {
        $('#console-log').append(
            '<div class="xmpp_' + type + '">' +
                StropheConsole.prettyXml(msg) +
                '</div>');
    },

    prettyXml: function(xml, level) {
        var i, j;
        var result = [];
        if (!level) {
            level = 0;
        }

        result.push('<div class="xml_level' + level + '">');
        result.push('<span class="xml_punc">&lt;</span>');
        result.push('<span class="xml_tag">');
        result.push(xml.tagName);
        result.push('</span>');

        // attributes
        var attrs = xml.attributes;
        var attrLead = [];
        for (i = 0; i < xml.tagName.length + 1; i++) {
            attrLead.push('&nbsp;');
        }
        attrLead = attrLead.join('');

        for (i = 0; i < attrs.length; i++) {
            result.push('<span class="xml_aname"> ');
            result.push(attrs[i].nodeName);
            result.push('</span><span class="xml_punc">="</span>');
            result.push('<span class="xml_avalue">');
            result.push(attrs[i].nodeValue);
            result.push('</span><span class="xml_punc">"</span>');

            if (i !== attrs.length - 1) {
                result.push('</div><div class="xml_level' + level + '">');
                result.push(attrLead);
            }
        }

        if (xml.childNodes.length === 0) {
            result.push('<span class="xml_punc">/&gt;</span></div>');
        } else {
            result.push('<span class="xml_punc">&gt;</span></div>');

            // children
            $.each(xml.childNodes, function() {
                if (this.nodeType === 1) {
                    result.push(StropheConsole.prettyXml(this, level + 1));
                } else if (this.nodeType === 3) {
                    result.push('<div class="xml_text xml_level' +
                                (level + 1) + '">');
                    result.push(this.nodeValue);
                    result.push('</div>');
                }
            });

            result.push('<div class="xml xml_level' + level + '">');
            result.push('<span class="xml_punc">&lt;/</span>');
            result.push('<span class="xml_tag">');
            result.push(xml.tagName);
            result.push('</span>');
            result.push('<span class="xml_punc">&gt;</span></div>');
        }

        return result.join('');
    }
};
