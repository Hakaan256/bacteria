var GamePlayScene = function(game, stage)
{
  var self = this;
  var assetter;
  var dbugger; //'debugger' is a keyword... (why.)
  var drawer;
  var ticker;
  var clicker;
  var hoverer;
  var dragger;
  var flicker;
  var presser;
  var particler;

  var NODE_TYPE_COUNT = 0;
  var NODE_TYPE_EMPTY    = NODE_TYPE_COUNT; NODE_TYPE_COUNT++;
  var NODE_TYPE_BACTERIA = NODE_TYPE_COUNT; NODE_TYPE_COUNT++;
  var NODE_TYPE_ANTIBIO  = NODE_TYPE_COUNT; NODE_TYPE_COUNT++;
  var NODE_TYPE_INVALID  = NODE_TYPE_COUNT; NODE_TYPE_COUNT++;

  var antibio_resist = 4.0;
  var grid;
  var node_selector;

  var Node = function(grid)
  {
    var self = this;

    self.c;
    self.r;

    self.w;
    self.h;
    self.x;
    self.y;

    self.s_w;
    self.s_h;
    self.s_x;
    self.s_y;

    self.type;
    self.hp;
    self.resist;
    self.bred;

    self.init = function(col, row, type)
    {
      self.c = col;
      self.r = row;

      self.s_w = self.w = grid.node_w;
      self.s_h = self.h = grid.node_h;
      self.s_x = self.x = grid.x+self.c*self.w;
      self.s_y = self.y = grid.y+self.r*self.h;

      self.type = type;
      self.hp = 100;
      self.resist = Math.random();
      self.bred = false;
    }

    self.tick = function()
    {
      if(self.hp == 0) self.type = NODE_TYPE_EMPTY;
      switch(self.type)
      {
        case NODE_TYPE_BACTERIA:
          self.hp++; if(self.hp > 100) self.hp = 100;
          break;
        case NODE_TYPE_ANTIBIO:
          break;
        case NODE_TYPE_EMPTY:
        default:
          break;
      }
    }

    self.draw = function(canv)
    {
      switch(self.type)
      {
        case NODE_TYPE_BACTERIA:
          canv.context.fillStyle = "rgba("+(Math.round(1.36*self.hp))+","+(Math.round(2.55*self.hp))+","+(Math.round(0.34*self.hp))+",1)";
          canv.context.fillRect(self.x,self.y,self.w,self.h);
          canv.context.lineWidth = 1;
          canv.context.strokeStyle = "rgba("+Math.round((1-self.resist)*255)+","+Math.round((1-self.resist)*255)+","+Math.round((1-self.resist)*255)+",1)";
          canv.context.strokeRect(self.x+0.5,self.y+0.5,self.w-1,self.h-1);
          break;
        case NODE_TYPE_ANTIBIO:
          canv.context.fillStyle = "rgba("+(Math.round(1.36*(100-self.hp)))+","+(Math.round(1.36*(100-self.hp)))+","+(Math.round(1.36*(100-self.hp)))+",1)";
          canv.context.fillRect(self.x,self.y,self.w,self.h);
          break;
        case NODE_TYPE_INVALID:
          canv.context.fillStyle = "#FF0000"
          canv.context.fillRect(self.x,self.y,self.w,self.h);
          break;
        case NODE_TYPE_EMPTY:
        default:
          //canv.context.fillStyle = "#FFFFAF"
          //canv.context.fillRect(self.x,self.y,self.w,self.h);
          break;
      }
    }
  }

  var Grid = function(x,y,w,h,n_rows,n_cols)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.n_rows = n_rows;
    self.n_cols = n_cols;

    self.node_w = self.w/n_cols;
    self.node_h = self.h/n_rows;

    self.nodes = [];
    self.invalidNode = new Node(self); self.invalidNode.init(-1,-1,NODE_TYPE_INVALID);

    var r; var c; var i;
    for(r=0;r<self.n_rows;r++)for(c=0;c<self.n_cols;c++)
    {
        i = (r*self.n_cols)+c;
        self.nodes[i] = new Node(self);
        self.nodes[i].init(c,r,Math.floor(Math.random()*Math.random()*Math.random()*Math.random()*(NODE_TYPE_COUNT-1)));
    }

    self.nodeAt = function(c,r) { return self.nodes[(r*self.n_cols)+c]; };
    self.validNodeAt = function(c,r)
    {
      if(c < 0 || c >= self.n_cols || r < 0 || r >= self.n_rows) return self.invalidNode;
      return self.nodeAt(c,r);
    };
    self.nearestType = function(c,r,t,max_d,unbred)
    {
      var nearest_node = self.invalidNode;
      var nearest_d = max_d+1;
      var min_c = Math.max(0,c-max_d);
      var max_c = Math.min(self.n_cols-1,c+max_d);
      var min_r = Math.max(0,r-max_d);
      var max_r = Math.min(self.n_rows-1,r+max_d);
      var tmp_c;
      var tmp_r;

      var tmp_node;
      var tmp_d;
      for(tmp_r = min_r; tmp_r <= max_r; tmp_r++)
      {
        for(tmp_c = min_c; tmp_c <= max_c; tmp_c++)
        {
          if((tmp_node = self.nodeAt(tmp_c, tmp_r)) && tmp_node.type == t && (!unbred || !tmp_node.bred) && //node exists / is correct type
             !(c == tmp_c && r == tmp_r)) //not center node
          {
            tmp_d = Math.abs(tmp_c-c)+Math.abs(tmp_r-r);
            if(tmp_d < nearest_d)
            {
              nearest_node = tmp_node;
              nearest_d = tmp_d;
            }
            else if(tmp_d == nearest_d)
            {
              if(Math.random() < 0.5) nearest_node = tmp_node; //BIASED!!!
            }
          }
        }
      }
      return nearest_node;
    };

    self.tick = function()
    {
      var r; var c; var i;

      //multiply
      {
        for(i = 0; i < self.n_rows*self.n_cols; i++)
          grid.nodes[i].bred = false;

        var nearest_bacteria;
        var nearest_empty;
        for(r=0;r<self.n_rows;r++)for(c=0;c<self.n_cols;c++)
        {
          i = (r*self.n_cols)+c;
          if(self.nodes[i].type == NODE_TYPE_BACTERIA)
          {
            nearest_bacteria = self.nearestType(c,r,NODE_TYPE_BACTERIA,3,true);
            if(nearest_bacteria.type != NODE_TYPE_INVALID)
            {
              nearest_empty = self.nearestType(c,r,NODE_TYPE_EMPTY,3,false);
              if(nearest_empty.type != NODE_TYPE_INVALID && Math.random() < 0.01)
              {
                nearest_empty.type = NODE_TYPE_BACTERIA;
                nearest_empty.resist = (self.nodes[i].resist+nearest_bacteria.resist)/2;
                nearest_empty.hp = Math.round((self.nodes[i].hp+nearest_bacteria.hp)/2);
                nearest_empty.bred = true; //disallow breeding on first cycle
                self.nodes[i].bred = true;
                nearest_bacteria.bred = true;
              }
            }
          }
        }
      }

      //murder
      {
        for(r=0;r<self.n_rows;r++)for(c=0;c<self.n_cols;c++)
        {
          i = (r*self.n_cols)+c;
          if(self.nodes[i].type == NODE_TYPE_ANTIBIO)
          {
            nearest_bacteria = self.nearestType(c,r,NODE_TYPE_BACTERIA,1,false);
            if(nearest_bacteria.type == NODE_TYPE_BACTERIA)
            {
              if(nearest_bacteria.hp - Math.round(self.nodes[i].hp*self.nodes[i].resist*(1-nearest_bacteria.resist)) > 0)
              {
                nearest_bacteria.hp -= Math.round(self.nodes[i].hp*antibio_resist*(1-nearest_bacteria.resist));
                self.nodes[i].hp = 0;
              }
              else
              {
                self.nodes[i].hp = Math.round(nearest_bacteria.hp/(antibio_resist*(1-nearest_bacteria.resist)));
                nearest_bacteria.hp = 0;
              }
            }
          }
        }
      }

      for(var i = 0; i < self.n_rows*self.n_cols; i++)
        self.nodes[i].tick();
    }

    self.draw = function(canv)
    {
      for(var i = 0; i < self.n_rows*self.n_cols; i++)
        self.nodes[i].draw(canv);
      canv.context.strokeStyle = "#000000";
      canv.context.strokeRect(self.x-0.5,self.y-0.5,self.w+1,self.h+1);
    }

  }

  var NodeSelector = function(grid)
  {
    var self = this;

    self.x = grid.x;
    self.y = grid.y;
    self.w = grid.w;
    self.h = grid.h;

    self.hovering_c = -1;
    self.hovering_r = -1;
    self.hovering_radius = 2;

    self.hover = function(evt)
    {
      self.hovering_c = Math.floor(grid.n_cols*((evt.doX-self.x)/self.w));
      self.hovering_r = Math.floor(grid.n_rows*((evt.doY-self.y)/self.h));
    }
    self.unhover = function(evt)
    {
      self.hovering_c = -1;
      self.hovering_r = -1;
    }
    self.dragStart = function(evt)
    {
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      var min_c = Math.max(0,self.hovering_c-self.hovering_radius);
      var max_c = Math.min(grid.n_cols-1,self.hovering_c+self.hovering_radius);
      var min_r = Math.max(0,self.hovering_r-self.hovering_radius);
      var max_r = Math.min(grid.n_rows-1,self.hovering_r+self.hovering_radius);

      for(var r = min_r; r <= max_r; r++) for(var c = min_c; c <= max_c; c++){
        if(Math.abs(c-self.hovering_c)+Math.abs(r-self.hovering_r) < self.hovering_radius)
        {
          var n = grid.nodeAt(c,r);
          switch(n.type)
          {
            case NODE_TYPE_BACTERIA:
              if(n.hp - Math.round(100*antibio_resist*(1-n.resist)) > 0)
                n.hp -= Math.round(100*antibio_resist*(1-n.resist));
              else
              {
                n.type = NODE_TYPE_ANTIBIO;
                n.hp = Math.round(n.hp/(antibio_resist*(1-n.resist)));
                n.resist = antibio_resist;
              }
              break;
            case NODE_TYPE_ANTIBIO:
              n.hp = 100;
              break;
            case NODE_TYPE_INVALID:
              break;
            case NODE_TYPE_EMPTY:
              n.type = NODE_TYPE_ANTIBIO;
              n.hp = 100;
              n.resist = antibio_resist;
            default:
              break;
          }
        }
      }
    }
    self.dragFinish = function(evt)
    {

    }
    self.draw = function(canv)
    {
      canv.context.strokeStyle = "#FF0000";
      var min_c = Math.max(0,self.hovering_c-self.hovering_radius);
      var max_c = Math.min(grid.n_cols-1,self.hovering_c+self.hovering_radius);
      var min_r = Math.max(0,self.hovering_r-self.hovering_radius);
      var max_r = Math.min(grid.n_rows-1,self.hovering_r+self.hovering_radius);

      for(var r = min_r; r <= max_r; r++) for(var c = min_c; c <= max_c; c++){
        if(Math.abs(c-self.hovering_c)+Math.abs(r-self.hovering_r) < self.hovering_radius)
          canv.context.strokeRect(grid.x+c*grid.node_w,grid.y+r*grid.node_h,grid.node_w,grid.node_h);
      }
    }
  }

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});

    grid = new Grid(20,20,stage.drawCanv.canvas.width-40-100,stage.drawCanv.canvas.height-40, 50, 100);
    node_selector = new NodeSelector(grid);
    hoverer.register(node_selector);
    dragger.register(node_selector);

  };

  var t = 0;
  self.tick = function()
  {
    grid.tick();
    hoverer.flush();
    dragger.flush();
  };

  self.draw = function()
  {
    grid.draw(stage.drawCanv);
    node_selector.draw(stage.drawCanv);
  };

  self.cleanup = function()
  {
  };

};

