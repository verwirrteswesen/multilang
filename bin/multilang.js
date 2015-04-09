"use strict";

var _ = require("lodash");
var yaml = require('js-yaml');
var fs = require('fs-promise');
var stripBom = require('strip-bom');

var multilang={}

multilang.langs={
    en:{
        name: 'english',
        abr: 'en',
        languages:{
            en: 'english',
            es: 'spanish',
            it: 'italian',
            ru: 'russian'
        },
        phrases:{
            language: 'language',
            'also available in': 'also available in',
            'DO NOT MODIFY DIRECTLY': 'DO NOT MODIFY DIRECTLY THIS FILE WAS GENERATED BY multilang.js'
        },
        defaultLang:true
    }
}
// esto se va a inicializar con los yaml de ./langs/lang-*.yaml

multilang.changeDoc=function changeDoc(documentText,lang){
    var langConv = this.parseLang(lang);
    var r='<!-- \n\n\n\n\n'
         +langConv.phrases['DO NOT MODIFY DIRECTLY']
         +' \n\n\n\n\n-->\n'
         + this.generateButtons(documentText, lang);
    // parsear tags
    var pat= new RegExp('\\[!--lang:('+lang+'|\\*)--]([^[]+)', 'g');
    var s;
    while(null != (s = pat.exec(documentText))) {
        r += '\n' + s[2].replace(/\n*$/,'');
    }
    r += '\n';
    return r;
}

multilang.obtainLangs=function obtainLangs(documentTextHeader){
    var all_langs = [];
    var def_lang = null; 
    var langs = /<!--multilang v[0-9]+\s+(.+)(-->)/.exec(documentTextHeader);
    if(langs) {
        var lang_re = /([a-z]{2}):([^.]+\.(md|html))/g;
        var lang;
        while(null != (lang = lang_re.exec(langs[1]))) {
            if(null == def_lang) { def_lang = lang[1]; }
            all_langs[lang[1]] = {'fileName' : lang[2] };
        }
    }
    return {main:def_lang, langs:all_langs};
}

var imgUrl = 'https://github.com/codenautas/multilang/blob/master/img/';

multilang.generateButtons=function generateButtons(documentTextHeader,lang) {
    var obtainedLangs = this.obtainLangs(documentTextHeader);
    if(null == this.langs[lang]) { this.langs[lang] = this.parseLang(lang); }
    var ln = _.merge({}, this.langs.en, this.langs[lang]); 
    var r='<!--multilang buttons -->\n';
    r += ln.phrases.language+': !['+ln.name+']('+imgUrl+'lang-'+ln.abr+'.png)\n';
    r += ln.phrases['also available in']+':';
    var gotToStrip=false;
    for(var lother in obtainedLangs.langs) {
        if(lother == lang) { continue; } 
        gotToStrip=true;
        var lname = ln.languages[lother];
        r += '\n[!['+lname+']('+imgUrl+'lang-'+lother+'.png)]('+obtainedLangs.langs[lother].fileName+') -';
    }
    if(gotToStrip) { r = r.substring(0, r.length-2); }
    return r;
}

multilang.splitDoc=function splitDoc(documentText){
    return [];
}

multilang.parseLang=function parseLang(lang){
    var langFile = './langs/lang-'+lang+'.yaml';
    return yaml.safeLoad(stripBom(fs.readFileSync(langFile, 'utf8')));
}

module.exports = multilang;
