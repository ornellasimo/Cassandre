function(doc, req){
  const ALPHA = /[a-zàâçéêèëïîôöüùû0-9]+|[^a-zàâçéêèëïîôöüùû0-9]+/gi;
  if (req.query.corpus!=doc.corpus) {
    return {
      "code": 302, 
      "headers":{ "Location": "../" + doc.corpus + "/" + doc._id }
    };
  }
  send('<html>');
  send('<head>');
  send('<link rel="icon" type="image/png" href="../../style/favicon.png" />');
  send('<link rel="stylesheet" type="text/css" href="../../style/main.css" />');
  send('<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />');
  send('<script type="text/javascript">\n');
  send('function httpGet(url) {\n');
  send('  var http = new XMLHttpRequest();\n');
  send('  http.open("GET", "../../" + url, false);\n');
  send('  http.setRequestHeader("Accept", "application/json");\n');
  send('  http.send("");\n');
  send('  return JSON.parse(http.responseText);\n');
  send('}\n');
  send('function toColor(metrics) {');
  send('    var grayLevel = Math.floor(255*(1-metrics)).toString(16);');
  send('    return "#" + grayLevel + grayLevel + grayLevel;');
  send('}\n');
  send('function highlightWords(type) {\n');
  send('  var words = document.getElementsByTagName("font");\n');
  send('  var metrics = wholeMetrics(type);\n');
  send('  for (i in words) {\n');
  send('    var w = words[i];\n');
  send('    w.color = toColor(wordMetrics(metrics, w.textContent, type));\n');
  send('  }\n');
  send('}\n');
  send('function highlightPhrases() {');
  send('  var view = httpGet("phrase/");');
  send('  var trigrams = [];');
  send('  for (i in view.rows) {');
  send('    var r = view.rows[i];');
  send('    trigrams[r.key] = r.value;');
  send('  }\n');
  send('  var markups = document.getElementsByTagName("font");');
  send('  var words = [];');
  send('  for (m=0; m<markups.length; m++) {\n');
  send('    words[m] = {text: markups[m].textContent.toLowerCase()};\n');
  send('  }\n');
  send('  words[0].count = 0;\n');
  send('  words[1].count = 0;\n');
  send('  words[2].count = 0;\n');
  send('  words[3].count = 0;\n');
  send('  var max = 0;\n');
  send('  for (w=0; w<words.length-4; w++) {\n');
  send('    var key =');
  send('      new Array(words[w].text, words[w+2].text, words[w+4].text);\n');
  send('    var nb = trigrams[key];\n');
  send('    if (!nb) nb = 1;');
  send('    words[w].count = Math.max(words[w].count, nb);\n');
  send('    words[w+2].count = Math.max(words[w+2].count, nb);\n');
  send('    words[w+4].count = nb;\n');
  send('    max = Math.max(max, words[w].count);\n');
  send('  }\n');
  send('  for (m=0; m<markups.length; m++) {');
  send('    markups[m].color = toColor(words[m].count/max);');
  send('  }');
  send('}\n');
  send('function wholeMetrics(type) {\n');
  send('  var corpus = {};\n');
  send('  var lexcorpus = httpGet("lexicometrics/");\n');//TODO level 2 would need a filter on corpus
  send('  for (i in lexcorpus.rows) {\n');
  send('    var c = lexcorpus.rows[i];\n');
  send('    corpus[c.key] = c.value;\n');
  send('  }\n');
  send('  var lexdoc = httpGet("lexicometrics/' + req.id + '");\n');
  send('  var metrics = {};\n');
  send('  var max_specific1 = 0;\n');
  send('  for (i in lexdoc.rows) {\n');
  send('    var d = lexdoc.rows[i];\n');
  send('    var word = d.key[1];\n');
  send('    var inCorpus = corpus[word];\n');
  send('    metrics[word] = {\n');
  send('      rare: 1/inCorpus.sum,\n');
  send('      specific1: Math.sqrt(d.value)/inCorpus.count,\n');
  send('    };\n');
  send('    max_specific1 = Math.max(max_specific1,metrics[word].specific1);\n');
  send('  }\n');
  send('  for (i in metrics) {\n');
  send('    var m = metrics[i];\n');
  send('    m.specific1 /= max_specific1;\n');
  send('  }\n');
  send('  return metrics;\n');
  send('}\n');
  send('function wordMetrics(metrics, word, type) {');
  send('  var w = metrics[word.toLowerCase()];');
  send('  switch (type) {');
  send('    case "specific1":');
  send('      return (w)?w.specific1:.05;');
  send('    case "rare":'); 
  send('      return (w)?w.rare:.05;');
  send('  }'); 
  send('}\n');
  send('</script></head><body>');
  send('<div id="container">');
  send('<form id="menu">');
  send('<input type="button" onClick="self.location=\'..\'" value="Corpus" />');
  send('<input type="button" onClick="self.location.reload(true)" value="Raw text" />');
  send('<input type="button" onClick="highlightWords(\'specific1\')" value="Specific words" />');
  send('<input type="button" onClick="highlightWords(\'rare\')" value="Rare words" />');
  send('<input type="button" onClick="highlightPhrases()" value="Repeated phrases" />');
  send('</form>');
  send('<div id="content">');
  send('<h1>');
  send(doc.name);
  send('</h1>');
  send('<table>');
  for each (p in doc.speeches) {
    send('<tr>');
    if (p.actor) {
      send('<th>');
      send(p.actor);
      send('</th>');
    }
    send('<td>');
    if (p.timestamp) {
      send('<div class="timestamp">');
      send(p.timestamp);
      send('</div>');
    }
    send('<div class="post">');
    var words = p.text.match(ALPHA);
    for each (w in words) {
      send('<font>');
      send(w);
      send('</font>');
    }
    send('</div>');
    send('</td></tr>');
  }
  send('</table>');
  send('</div>');
  send('<div id="footer"><a href="http://cassandre-qda.sourceforge.net/about.html">Cassandre</a> &nbsp;</div>');
  send('</div>');
  send('</body></html>');
}
