function(doc) {
  if (doc.name) {
    emit([doc.corpus,doc.name]);
  }
}
