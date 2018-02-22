module.exports = function( block ) {
  return block
    .replace( /\\/g, '\\\\'  )
    .replace( /\n/g, '\n'   );
};