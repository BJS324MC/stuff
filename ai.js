let count=0;
class AI{
  constructor(){
    this.globalSum = 0;
    this.history = [];
    this.turn=1;
    this.rows=6;
    this.columns=7;
    this.board = new Array(this.rows * this.columns).fill(0);
    this.table={};
  }
  pass() {
    this.turn = (this.turn+1)%2;
  }
  columnAvailable(c) {
    return this.val(0, c) === 0;
  }
  load(pgn) {
    pgn=pgn.split(" ");
    let dash = pgn.indexOf("-"),
      white = pgn.slice(0,dash),
      black = pgn.slice(dash + 1);
    for (let e of white) this.board[e] = 1;
    for (let e of black) this.board[e] = 2;
    this.turn = white.length === black.length ? 1 : 0;
  }
  reset() {
    this.board = new Array(this.rows * this.columns).fill(0);
  }
  forAll(fc) {
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.columns; j++) fc(i, j);
  }
  moves() {
    let moves = [];
    for (let i = 0; i < this.columns; i++)
      if (this.columnAvailable(i)) moves.push(i);
    return moves;
  }
  setarr(r, c, v) {
    this.board[r * this.columns + c] = v;
  }
  val(r, c) {
    return this.board[r * this.columns + c];
  }
  getEmptyRow(c) {
    if (!this.columnAvailable(c)) return false;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.val(r, c) === 0) return r;
    }
  }
  isDraw() {
    for (let i = 0; i < this.columns; i++)
      if (this.columnAvailable(i)) return false;
    return true;
  }
  hasWon(color) {
    let col = color === 1 ? 1 : color === 0 ? 2 : 0,
      won = false;
    this.forAll((i, j) => {
      if (this.val(i, j) !== col) return;
      let k=Array(3).fill(0),rb=this.rows/2,cb=Math.ceil(this.columns/2),
        horizontal = k.map((a, b) => [i, j + b + 1]),
        vertical = k.map((a, b) => [i + b + 1, j]),
        diagonalleft = k.map((a, b) => [i + b + 1, j + b + 1]),
        diagonalright = k.map((a, b) => [i + b + 1, j - b - 1]),
        check = ar => {if(ar.every(x => this.val(x[0],x[1]) === col)) won = true};
      if(j<cb)check(horizontal); 
      if(i<rb)check(vertical);
      if (j <= (this.columns - 4)) check(diagonalleft);
      if (j >= Math.floor(this.columns/2)) check(diagonalright);
    });
    return won;
  }
  move(c = 0, color = this.turn) {
    if (this.gameEnded) return false;
    let r = this.getEmptyRow(c);
    if (typeof r === "number") {
      let t = color === 1 ? 1 : 2;
      this.setarr(r, c, t);
      this.history.push(r*this.columns+c);
      this.pass();
    }
  }
  pgn() {
    let pgn = "-";
    this.forAll((i, j) => {
      if (this.val(i, j) === 1) pgn = (i * this.columns + j) + " " + pgn;
      else if (this.val(i, j) === 2) pgn = pgn + " " + (i * this.columns + j);
    });
    return pgn;
  }
  evaluateBoard(oldSum, color) {
    let col = color === 1 ? 1 : color === 0 ? 2 : -1,
      newSum = oldSum,
      score = {
        0: 0,
        1: 1,
        2: 2,
        3: 4
      };
    this.forAll((i, j) => {
      let loc,
          vl=this.val(i, j);
      if (vl !== 0) loc = vl;
      let k=Array(3).fill(0),
          horizontal = k.map((a, b) => [i, j + b + 1]),
          vertical = k.map((a, b) => [i + b + 1, j]),
          diagonalleft = k.map((a, b) => [i + b + 1, j + b + 1]),
          diagonalright = k.map((a, b) => [i + b + 1, j - b - 1]),
        check = (c, ar) => {
          let count = 0;
          if (c)
            for (let x of ar) {
              let v = this.val(...x);
              if (!loc && v !== 0) loc = v;
              if (v === loc) count++;
              else if (v !== 0) {
                count = 0;
                break
              }
            }
          newSum += score[count] * (loc === col ? 1 : -1);
          if (vl !== 0) loc = vl;
          else loc = undefined;
        };
      check(j <= 3, horizontal);
      if (i <= 2) {
        if (check(true, vertical));
        check(j <= 3, diagonalleft);
        check(j >= 3, diagonalright);
      }
    });
    return newSum;
  }
  undo() {
    let hp = this.history.pop();
    this.board[hp]=0;
    this.gameEnded = false;
    this.pass();
    return hp;
  }
  maximin(depth = 1, alpha, beta, isMaximizingPlayer, sum = 0, color) {
    count++;
    if (this.hasWon(isMaximizingPlayer ? 0 : 1)) {
      if (isMaximizingPlayer) {
        return { 0: null, 1: 690 + depth, 2: [] }
      } else {
        return { 0: null, 1: -690 - depth, 2: [] }
      }
    }
    let children = this.moves().sort((a, b) => Math.abs(3 - b) - Math.abs(3 - a));
    if (depth === 0 || children.length === 0) {
      return { 0: null, 1: sum, 2: [] };
    }
    let pn = this.board.toString();
    if (pn in this.table) {
      let mv = this.table[pn];
      children.unshift(children.splice(children.indexOf(mv), 1)[0]);
    };
    var maxValue = -Infinity;
    var minValue = Infinity;
    var bestMove, currMove, bestLine;
    for (var i = 0; i < children.length; i++) {
      currMove = children[i];
      this.move(currMove);
      var newSum = -this.evaluateBoard(sum, 1);
      var res = this.maximin(depth - 1, alpha, beta, !isMaximizingPlayer, newSum, color);
      var childValue = res[1];
      this.undo();
      if (isMaximizingPlayer) {
        if (childValue > maxValue) {
          maxValue = childValue;
          bestMove = currMove;
          bestLine = [currMove].concat(res[2]);
        }
        if (childValue > alpha) {
          alpha = childValue;
        }
      } else {
        if (childValue < minValue) {
          minValue = childValue;
          bestMove = currMove;
          bestLine = [currMove].concat(res[2]);
        }
        if (childValue < beta) {
          beta = childValue;
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    this.table[pn] = bestMove;
    if (isMaximizingPlayer) {
      return { 0: bestMove, 1: maxValue, 2: bestLine }
    } else {
      return { 0: bestMove, 1: minValue, 2: bestLine }
    }
  }
  minimax(depth=1, alpha, beta, isMaximizingPlayer, sum = 0, color) {
    count++;
    if (this.hasWon(isMaximizingPlayer ? 0 : 1)) {
      if (isMaximizingPlayer) {
        return {0:null,1:-690 - depth,2:[]}
      } else {
        return {0:null,1:690 + depth,2:[]}
      }
    }
    let children = this.moves().sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));
    if (depth === 0 || children.length === 0) {
      return {0:null, 1:sum,2:[]};
    }
    let pn=this.board.toString();
    if(pn in this.table){
      let mv=this.table[pn];
      children.unshift(children.splice(children.indexOf(mv),1)[0]);
    };
    var maxValue = -Infinity;
    var minValue = Infinity;
    var bestMove, currMove,bestLine;
    for (var i = 0; i < children.length; i++) {
      currMove = children[i];
      this.move(currMove);
      var newSum = this.evaluateBoard(sum, 1);
      var res = this.minimax(depth - 1, alpha, beta, !isMaximizingPlayer, newSum, color);
      var childValue=res[1];
      this.undo();
      if (isMaximizingPlayer) {
        if (childValue > maxValue) {
          maxValue = childValue;
          bestMove = currMove;
          bestLine=[currMove].concat(res[2]);
        }
        if (childValue > alpha) {
          alpha = childValue;
        }
      } else {
        if (childValue < minValue) {
          minValue = childValue;
          bestMove = currMove;
          bestLine=[currMove].concat(res[2]);
        }
        if (childValue < beta) {
          beta = childValue;
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    this.table[pn]=bestMove;
    if (isMaximizingPlayer) {
      return {0:bestMove, 1:maxValue,2:bestLine}
    } else {
      return {0:bestMove, 1:minValue,2:bestLine}
    }
  }
  async getBestMove(depth) {
    return this.minimax(Number(depth), -Infinity, Infinity, this.turn === 1, 0,1);
  }
  async ID(depth=6){
    count=0;
    for(let i=1;i<depth;i++){
      let m=await this.getBestMove(i)
      postMessage("Depth: "+i+" Best Move: "+m[0]+" Score: "+m[1]+" Line: "+m[2]+" Count: "+count);
    }
    return await this.getBestMove(depth);
  }
}
const ai = new AI();
onmessage = e => {
  const response=e.data.replace(" ",",").split(",");
  if(response[0]==="search")ai.ID(response[1]).then(a=>postMessage(a));
  else if(response[0]==="");
  else if(response[0]==="access")postMessage(JSON.stringify(ai[response[1]]));
  else if(response[0]=="position")ai.load(response[1]);
}
