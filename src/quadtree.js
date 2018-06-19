
/* quadTree node constructor */
function treeNode(data, x, y, dx, dy) {
  var dx_tmp = dx,
    dy_tmp = dy,
    msb_x  = 0,
    msb_y  = 0;

  /* left-bottom corner of current quadrant */
  this.x = x;
  this.y = y;

  /* minimum value in subtree under this node */
  this.lowerBound = null;
  /* maximum value in subtree under this node */
  this.upperBound = null;

  /*
   *  child nodes are layed out in the following way:
   *
   *  (x, y + 1) ---- (x + 1, y + 1)
   *  |             |              |
   *  |      D      |      C       |
   *  |             |              |
   *  |----------------------------|
   *  |             |              |
   *  |      A      |      B       |
   *  |             |              |
   *  (x, y) ------------ (x + 1, y)
   */
  this.childA = null;
  this.childB = null;
  this.childC = null;
  this.childD = null;

  if ((dx === 1) && (dy === 1)) {
    /* do not further subdivision */
    this.lowerBound = Math.min(
      data[y][x],
      data[y][x + 1],
      data[y + 1][x + 1],
      data[y + 1][x]
    );
    this.upperBound = Math.max(
      data[y][x],
      data[y][x + 1],
      data[y + 1][x + 1],
      data[y + 1][x]
    );
  } else {
    /* get most significant bit from dx */
    if (dx > 1) {
      while (dx_tmp !== 0) {
        dx_tmp = dx_tmp >> 1;
        msb_x++;
      }

      if (dx === (1 << (msb_x - 1)))
        msb_x--;

      dx_tmp = 1 << (msb_x - 1);
    }

    /* get most significant bit from dx */
    if (dy > 1) {
      while (dy_tmp !== 0) {
        dy_tmp = dy_tmp >> 1;
        msb_y++;
      }

      if (dy === (1 << (msb_y - 1)))
        msb_y--;

      dy_tmp = 1 << (msb_y - 1);
    }

    this.childA = new treeNode(data, x, y, dx_tmp, dy_tmp);
    this.lowerBound = this.childA.lowerBound;
    this.upperBound = this.childA.upperBound;

    if (dx - dx_tmp > 0) {
      this.childB = new treeNode(data, x + dx_tmp, y, dx - dx_tmp, dy_tmp);
      this.lowerBound = Math.min(this.lowerBound, this.childB.lowerBound);
      this.upperBound = Math.max(this.upperBound, this.childB.upperBound);

      if (dy - dy_tmp > 0) {
        this.childC = new treeNode(data, x + dx_tmp, y + dy_tmp, dx - dx_tmp, dy - dy_tmp);
        this.lowerBound = Math.min(this.lowerBound, this.childC.lowerBound);
        this.upperBound = Math.max(this.upperBound, this.childC.upperBound);
      }
    }

    if (dy - dy_tmp > 0) {
      this.childD = new treeNode(data, x, y + dy_tmp, dx_tmp, dy - dy_tmp);
      this.lowerBound = Math.min(this.lowerBound, this.childD.lowerBound);
      this.upperBound = Math.max(this.upperBound, this.childD.upperBound);
    }
  }
}


/**
 *  Retrieve a list of cells within a particular range of values by
 *  recursivly traversing the quad tree to it's leaves.
 *
 *  @param  subsumed  If 'true' include all cells that are completely
 *                    subsumed within the specified range. Otherwise,
 *                    return only cells where at least one corner is
 *                    outside the specified range.
 *
 *  @return   An array of objects 'o' where each object has exactly two
 *            properties: 'o.x' and 'o.y' denoting the left-bottom corner
 *            of the corresponding cell.
 */
treeNode.prototype.cellsInBand = function(lowerBound, upperBound, subsumed) {
  var cells = [];

  subsumed = subsumed || true;

  if ((this.lowerBound > upperBound) || (this.upperBound < lowerBound))
    return cells;

  if (!(this.childA || this.childB || this.childC || this.childD)) {
    if ((subsumed) ||
        (this.lowerBound <= lowerBound) ||
        (this.upperBound >= upperBound)) {
      cells.push({
        x: this.x,
        y: this.y
      });
    }
  } else {
    if (this.childA)
      cells = cells.concat(this.childA.cellsInBand(lowerBound, upperBound, subsumed));

    if (this.childB)
      cells = cells.concat(this.childB.cellsInBand(lowerBound, upperBound, subsumed));

    if (this.childC)
      cells = cells.concat(this.childC.cellsInBand(lowerBound, upperBound, subsumed));

    if (this.childD)
      cells = cells.concat(this.childD.cellsInBand(lowerBound, upperBound, subsumed));
  }

  return cells;
};


/*
 * Given a scalar field `data` construct a quadTree
 * to efficiently lookup those parts of the scalar
 * field where values are within a particular
 * range of [lowerbound, upperbound] limits.
 */
function quadTree(data) {
  /* do some input checking */
  if (!data)
    throw new Error('data is required');
  if (!Array.isArray(data) ||
      !Array.isArray(data[0]))
    throw new Error('data must be scalar field, i.e. array of arrays');

  /* create pre-processing object */
  this.data = data;
  /* root node, i.e. entry to the data */
  this.root = new treeNode(data, 0, 0, data[0].length - 1, data.length - 1);
}


export {quadTree};
