var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = dc.context;

  var ENUM;

  ENUM = 0;
  var NODE_TYPE_NONE = ENUM; ENUM++;
  var NODE_TYPE_BADB = ENUM; ENUM++;
  var NODE_TYPE_GOOD = ENUM; ENUM++;
  var NODE_TYPE_BODY = ENUM; ENUM++;

  ENUM = 0;
  var CLICK_FUNC_NONE = ENUM; ENUM++;
  var CLICK_FUNC_KILL = ENUM; ENUM++;
  var CLICK_FUNC_DAMG = ENUM; ENUM++;
  var CLICK_FUNC_BADB = ENUM; ENUM++;
  var CLICK_FUNC_GOOD = ENUM; ENUM++;
  var CLICK_FUNC_BODY = ENUM; ENUM++;

  var DARK_COLOR = "#333333";
  var LIGHT_COLOR = "#DDDDDD";

  var presser;
  var hoverer;
  var dragger;

  var grid;

  var AveDisplay = function(x,y,w,h,grid)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.gradient;

    self.draw = function(canv)
    {
      if(!self.gradient)
      {
        self.gradient = canv.context.createLinearGradient(0, self.y+self.h, 0, self.y);
        self.gradient.addColorStop(0, "#FF8888");
        self.gradient.addColorStop(1, "#880000");
      }

      canv.context.fillStyle = self.gradient;
      canv.context.fillRect(self.x,self.y,self.w,self.h);

      var y = (1-grid.ave_badb_biot_resist)*self.h+self.y;

      canv.context.fillStyle = "white";
      canv.context.strokeStyle = DARK_COLOR;
      canv.context.beginPath();
      canv.context.moveTo(self.x+self.w+2, y);
      canv.context.lineTo(self.x+self.w+8, y-4);
      canv.context.lineTo(self.x+self.w+8, y+4);
      canv.context.closePath();
      canv.context.stroke();
      canv.context.fill();

      if(y < self.y+self.h-2) //don't display text if really low
      {
        canv.context.fillStyle = DARK_COLOR;
        canv.context.font = "12px Helvetica Neue";
        canv.context.fillText("Avg. Resist",self.x+self.w+12,y+4);
      }
    }
  }

  var SplitDisplay = function(x,y,w,h,grid)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.draw = function(canv)
    {
      var y = 0;
           if(grid.n_badb < 1) y = 0;
      else if(grid.n_good < 1) y = 1;
      else                     y = (grid.n_badb/(grid.n_badb+grid.n_good));

      y = y*self.h+self.y;

      canv.context.fillStyle = DARK_COLOR;
      canv.context.fillRect(self.x,self.y,self.w,y-self.y);
      canv.context.fillStyle = "green";
      canv.context.fillRect(self.x,y,self.w,self.h-(y-self.y));

      canv.context.fillStyle = "white";
      canv.context.strokeStyle = DARK_COLOR;
      canv.context.beginPath();
      canv.context.moveTo(self.x-2, y);
      canv.context.lineTo(self.x-8, y-4);
      canv.context.lineTo(self.x-8, y+4);
      canv.context.closePath();
      canv.context.stroke();
      canv.context.fill();
    }
  }

  var TricolorDisplay = function(x,y,w,h,grid)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.draw = function(canv)
    {
      if(grid.n_r + grid.n_g + grid.n_b == 0)
      {
        canv.context.fillStyle = DARK_COLOR;
        canv.context.fillRect(self.x,self.y,self.w,self.h);
      }

      var nt = grid.n_r+grid.n_g+grid.n_b;
      var rh = (grid.n_r/nt)*self.h;
      var gh = (grid.n_g/nt)*self.h;
      var bh = (grid.n_b/nt)*self.h;

      canv.context.fillStyle = "red";
      canv.context.fillRect(self.x,self.y,self.w,rh);
      canv.context.fillStyle = "green";
      canv.context.fillRect(self.x,self.y+rh,self.w,gh);
      canv.context.fillStyle = "blue";
      canv.context.fillRect(self.x,self.y+rh+gh,self.w,bh);

      canv.context.font = "12px Helvetica Neue";
      var y;
      if(grid.n_r)
      {
        y = self.y+rh/2;
        canv.context.fillStyle = DARK_COLOR;
        canv.context.fillText("% Red",self.x+self.w+12,y+4);
        canv.context.fillStyle = "white";
        canv.context.strokeStyle = DARK_COLOR;
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w+2, y);
        canv.context.lineTo(self.x+self.w+8, y-4);
        canv.context.lineTo(self.x+self.w+8, y+4);
        canv.context.closePath();
        canv.context.stroke();
        canv.context.fill();
      }
      if(grid.n_g)
      {
        y = self.y+rh+gh/2;
        canv.context.fillStyle = DARK_COLOR;
        canv.context.fillText("% Green",self.x+self.w+12,y+4);
        canv.context.fillStyle = "white";
        canv.context.strokeStyle = DARK_COLOR;
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w+2, y);
        canv.context.lineTo(self.x+self.w+8, y-4);
        canv.context.lineTo(self.x+self.w+8, y+4);
        canv.context.closePath();
        canv.context.stroke();
        canv.context.fill();
      }
      if(grid.n_b)
      {
        y = self.y+rh+gh+bh/2;
        canv.context.fillStyle = DARK_COLOR;
        canv.context.fillText("% Blue",self.x+self.w+12,y+4);
        canv.context.fillStyle = "white";
        canv.context.strokeStyle = DARK_COLOR;
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w+2, y);
        canv.context.lineTo(self.x+self.w+8, y-4);
        canv.context.lineTo(self.x+self.w+8, y+4);
        canv.context.closePath();
        canv.context.stroke();
        canv.context.fill();
      }
    }
  }

  var HSLDisplay = function(x,y,w,h,grid)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.gradient;
    self.pts = [];
    for(var i = 0; i < grid.cols*grid.rows+1; i++) self.pts[i] = 999;
    function sortNumber(a,b) { return a - b; }

    self.hsl = { h:0, s:1, l:0.6 };
    self.rgb = { r:0, g:0, b:0 };

    self.start_green = 0;
    self.end_green = 0;

    self.draw = function(canv)
    {
      var i = 0;
      var n_pts = 0;
      for(var r = 0; r < grid.rows; r++)
      {
        for(var c = 0; c < grid.cols; c++)
        {
          if(grid.nodeAt(c,r).type == NODE_TYPE_BADB)
          {
            self.pts[i] = grid.nodeAt(c,r).h;
            i++;
          }
        }
      }
      n_pts = i;
      while(self.pts[i] != 999) { self.pts[i] = 999; i++; }
      self.pts.sort(sortNumber);

      self.start_green = 0;
      self.end_green = 0;

      if(n_pts == 0)
        canv.context.fillStyle = DARK_COLOR;
      else if(n_pts == 1)
      {
        self.hsl.h = self.pts[0];
        HSL2RGB(self.hsl,self.rgb);
        canv.context.fillStyle = RGB2Hex(self.rgb);
      }
      else
      {
        self.gradient = canv.context.createLinearGradient(0, self.y+self.h, 0, self.y);
        for(var i = 0; i < n_pts; i++)
        {
          self.hsl.h = self.pts[i];
          if(!self.start_green && self.hsl.h > 90) { self.start_green = i/(n_pts-1); self.end_green = self.start_green; }
          if(self.start_green && self.hsl.h < 150) self.end_green = i/(n_pts-1);
          HSL2RGB(self.hsl,self.rgb);
          self.gradient.addColorStop(i/(n_pts-1), RGB2Hex(self.rgb));
        }
        canv.context.fillStyle = self.gradient;
      }

      canv.context.fillRect(self.x,self.y,self.w,self.h);

      var ys = self.y+(1-self.start_green)*self.h;
      canv.context.fillStyle = "white";
      canv.context.strokeStyle = DARK_COLOR;
      canv.context.beginPath();
      canv.context.moveTo(self.x+self.w+2, ys);
      canv.context.lineTo(self.x+self.w+8, ys-4);
      canv.context.lineTo(self.x+self.w+8, ys+4);
      canv.context.closePath();
      canv.context.stroke();
      canv.context.fill();

      var ye = self.y+(1-self.end_green)*self.h;
      canv.context.fillStyle = "white";
      canv.context.strokeStyle = DARK_COLOR;
      canv.context.beginPath();
      canv.context.moveTo(self.x+self.w+2, ye);
      canv.context.lineTo(self.x+self.w+8, ye-4);
      canv.context.lineTo(self.x+self.w+8, ye+4);
      canv.context.closePath();
      canv.context.stroke();
      canv.context.fill();

      if(ys-6 > ye+6)
      {
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w+5, ys-6);
        canv.context.lineTo(self.x+self.w+5, ye+6);
        canv.context.stroke();
      }
    }
  }

  var Node = function(init)
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 1;
    self.height = 1; //to maintain 'self.h' as flat HSL object

    self.row = 0;
    self.col = 0;

    self.parent_node = undefined;

    self.r = init.default_r;
    self.g = init.default_g;
    self.b = init.default_g;

    self.h = init.default_h;
    self.s = init.default_s;
    self.l = init.default_l;

    if(init.colored_hs) HSL2RGB(self,self); //sets RGB based on HSL

    self.type = 0;
    self.biot_resist = 0.1;
    self.body_resist = 0.1;
    self.age = 0;
    self.anim_prog = 0;

    self.health = 1;

    self.setPos = function(col,row,n_cols,n_rows,rect)
    {
      self.row = row;
      self.col = col;

      self.x = floor(rect.x+col/n_cols*rect.w);
      self.y = floor(rect.y+row/n_rows*rect.h);
      self.w = ceil(1/n_cols*rect.w);
      self.height = ceil(1/n_rows*rect.h);
    }

    self.setType = function(t)
    {
      self.type = t;
      self.age = 0;
      self.anim_prog = 1;
      if     (t == NODE_TYPE_BADB) self.body_resist = 0.3;
      else if(t == NODE_TYPE_BODY) self.biot_resist = rand();
      self.health = 1;
    }

    self.clone = function(n)
    {
      self.x = n.x;
      self.y = n.y;
      self.w = n.w;
      self.height = n.height;

      self.row = n.row;
      self.col = n.col;

      self.cloneMutables(n);
    }
    self.cloneMutables = function(n)
    {
      self.parent_node = n.parent_node;

      self.r = n.r;
      self.g = n.g;
      self.b = n.b;

      self.h = n.h;
      self.s = n.s;
      self.l = n.l;

      self.type = n.type;
      self.biot_resist = n.biot_resist;
      self.body_resist = n.body_resist;
      self.age = n.age;
      self.anim_prog = n.anim_prog;

      self.health = n.health;
    }

    self.draw = function(canv, colorblind, stroke)
    {
      var x = self.x;
      var y = self.y;
      var w = self.w;
      var h = self.height;

      var resist_drawn = self.biot_resist;
      var r_drawn = self.r;
      var g_drawn = self.g;
      var b_drawn = self.b;

      if(self.type == NODE_TYPE_BADB || self.type == NODE_TYPE_GOOD)
      {
        if(self.anim_prog > 0)
        {
          var sub_prog = 0;
          if(!(self.parent_node && self.parent_node.type == self.type) && self.anim_prog > 0.8) self.anim_prog = 0.8;
          if(self.anim_prog > 0.8) //parent moving to multiply
          {
            sub_prog = (1-self.anim_prog)/0.2;
            sub_prog *= sub_prog;
            resist_drawn = self.parent_node.biot_resist;
            r_drawn = self.parent_node.r;
            g_drawn = self.parent_node.g;
            b_drawn = self.parent_node.b;
            if(self.parent_node.col < self.col) //multiply to the right
            {
              x = self.parent_node.x;
              w = self.w + (sub_prog*self.w);
            }
            else if(self.parent_node.col > self.col) //multiply to the left
            {
              x = self.parent_node.x - (sub_prog*self.w);
              w = self.w + (sub_prog*self.w);
            }
            else if(self.parent_node.row < self.row) //multiply to the bottom
            {
              y = self.parent_node.y;
              h = self.height + (sub_prog*self.height);
            }
            else if(self.parent_node.row > self.row) //multiply to the top
            {
              y = self.parent_node.y - (sub_prog*self.height);
              h = self.height + (sub_prog*self.height);
            }
          }
          else //bounce
          {
            sub_prog = (0.8-self.anim_prog)/0.8;

            var b = sin(sub_prog*pi*2*3)*(1-sub_prog)*self.w/5.;
            x -= b/2;
            y -= b/2;
            w += b;
            h += b;
          }
        }
      }

      canv.context.strokeStyle = DARK_COLOR;

      switch(self.type)
      {
        case NODE_TYPE_NONE:
          break;
        case NODE_TYPE_BADB:
          canv.context.fillStyle = "#AA4499";
          if(stroke)
          {
            //canv.context.strokeRect(x,y,w,h);
          }
          else
          {
            if(init.colored_hsl || init.colored_rgb)
            {
              canv.context.fillStyle = "rgba("+floor(r_drawn*255)+","+floor(g_drawn*255)+","+floor(b_drawn*255)+",1)";
              canv.context.fillRect(x,y,w,h);
              if(colorblind)
              {
                canv.context.fillStyle = "white";
                canv.context.fillRect(x+w/4,y+h/4,w/2,h/2);
              }
            }
            else
            {
              canv.context.drawImage(bact_imgs[floor(resist_drawn*(bact_imgs.length-1))],x,y,w,h);
            }
          }
          break;
        case NODE_TYPE_GOOD:
          canv.context.fillStyle = "#AAFF99";
          if(stroke)
          {
            canv.context.strokeRect(x,y,w,h);
          }
          else
          {
            if(init.colored_hsl || init.colored_rgb)
            {
              canv.context.fillStyle = "rgba("+(r_drawn*255)+","+(g_drawn*255)+","+(b_drawn*255)+",1)";
              canv.context.fillRect(x,y,w,h);
            }
            else
            {
              var r = floor((1-resist_drawn)*128);
              canv.context.fillStyle = "rgba("+r+","+(128+r)+","+r+",1)";
              canv.context.fillRect(x,y,w,h);
            }
          }
          break;
        case NODE_TYPE_BODY:
          canv.context.fillStyle = "#882222";
          if(stroke)
          {
            canv.context.strokeRect(x,y,w,h);
          }
          else
          {
            canv.context.fillRect(x,y,w,h);
          }
          break;
      }
    }

    self.tick = function()
    {
      if(self.anim_prog > 0) self.anim_prog -= 0.01;
      self.age += init.sim_speed;

      if(self.type == NODE_TYPE_BODY)
      {
        self.body_resist -= 0.001*init.sim_speed;
        if(self.body_resist < 0) self.body_resist = 0;
      }
    }
  }

  var Grid = function(init)
  {
    var self = this;

    self.prerequisite_met;
    self.ave_disp;
    self.split_disp;
    self.tricolo_disp;
    self.hsl_disp;

    self.speed_slider;

    self.dose_amt;
    self.dosing_prog;
    self.dosing_prog_rate;
    self.dose_slider;
    self.dose_button;

    self.reset_button;

    self.ticks_outside;
    self.ticks_playing;
    self.ticks_initialized;

    self.external_biot_resist;
    self.sneeze_button;
    self.catch_button;

    self.colorblind_mode;
    self.colorblind_button;

    var default_init =
    {
      x:0,
      y:0,
      w:500,
      h:500,
      cols:50,
      rows:25,
      colored_rgb:false,
      default_r:0.5,
      default_g:0.5,
      default_b:0.5,
      colored_hsl:false,
      default_h:150,
      default_s:1,
      default_l:0.7,
      colorblind:false,
      sim_speed:1,
      badb_sim_speed:1,
      allow_sim_speed_slider:false,
      sim_speed_min:1,
      sim_speed_max:2,
      display_pause:true,
      allow_dose_slider:false,
      allow_dose_button:false,
      dose_chip_damage:false,
      allow_reset:true,
      prompt_reset_on_empty:false,
      allow_contaminate:false,
      default_badb_resist:0.1,
      init_badb:true,
      reinit_badb:true,
      default_good_resist:0.1,
      allow_good:true,
      init_good:true,
      reinit_good:true,
      allow_body:true,
      init_body:true,
      reinit_body:true,
      swab_size:1,
      click_function:CLICK_FUNC_NONE,
      hover_function:CLICK_FUNC_NONE,
      show_hover:false,
      mutate_random_assign:false,
      mutate_rate:0.1,
      mutate_distance:0.1,
      bias_mutate:true,
      reproduce:true,
      age:true,
      ave_display_width:0,
      split_display_width:0,
      tricolor_display_width:0,
      hsl_display_width:0,
    };

    var self = this;
    doMapInitDefaults(init,init,default_init);

    self.x = init.x;
    self.y = init.y;
    self.w = init.w;
    self.h = init.h;

    self.cols = init.cols;
    self.rows = init.rows;
    //double buffer nodes. unfortunate indirection, but yields cleaner sim.
    self.nodes_a = [];
    self.nodes_b = [];
    self.node_buffs = [self.nodes_a,self.nodes_b];
    self.node_buff = 0;

    self.n_nodes = 0;
    self.n_badb = 0; self.ave_badb_biot_resist = 0;
    self.n_good = 0; self.ave_badb_biot_resist = 0;
    self.n_body = 0; self.ave_badb_biot_resist = 0;
    self.n_r = 0;
    self.n_g = 0;
    self.n_b = 0;

    self.external_biot_resist = 0.1;
    if(init.allow_contaminate)
    {
      self.sneeze_button = new ButtonBox(dc.width-30,10,20,20,function(){ self.external_biot_resist = self.ave_badb_biot_resist; })
      presser.register(self.sneeze_button);
      self.catch_button = new ButtonBox(dc.width-30,40,20,20,function(){
        self.nodeAt(9,10).setType(NODE_TYPE_BADB);
        self.nodeAt(9,10).biot_resist = self.external_biot_resist;
      })
      presser.register(self.catch_button);
    }

    if(init.allow_sim_speed_slider)
    {
      self.simspeed_slider = new SmoothSliderBox(10,dc.height-30,100,20,init.sim_speed_min,init.sim_speed_max,init.sim_speed,function(v){ init.sim_speed = v; });
      dragger.register(self.simspeed_slider);
    }

    if(init.allow_dose_slider)
    {
      self.dose_button = new ButtonBox(10,dc.height-30,20,20,function(){ if(self.prerequisite_met) self.dosing_prog = self.dosing_prog_rate; })
      presser.register(self.dose_button);

      self.dose_amt = 0.;
      self.dosing_prog = 0;
      self.dosing_prog_rate = 0.01;
      self.dose_slider = new SmoothSliderBox(40,dc.height-30,100,20,0.0,1.0,0.0,function(v){ self.dose_amt = v; });
      dragger.register(self.dose_slider);
    }
    else if(init.allow_dose_button)
    {
      self.dose_button = new ButtonBox(10,dc.height-30,20,20,function(){ if(self.prerequisite_met) self.dosing_prog = self.dosing_prog_rate; })
      presser.register(self.dose_button);

      self.dose_amt = 0;
      self.dosing_prog = 0;
      self.dosing_prog_rate = 1;
    }

    if(init.allow_reset)
    {
      self.reset_button = new ButtonBox(self.x+self.w-100,dc.height-30,90,20,function(){ self.reset(); })
      presser.register(self.reset_button);
    }

    if(init.ave_display_width > 0)
    {
      self.ave_disp = new AveDisplay(self.w,0,init.ave_display_width,dc.height,self);
    }

    if(init.split_display_width > 0)
    {
      self.split_disp = new SplitDisplay(self.w,0,init.split_display_width,dc.height,self);
    }

    if(init.tricolor_display_width > 0)
    {
      self.tricolor_disp = new TricolorDisplay(self.w,0,init.tricolor_display_width,dc.height,self);
    }

    if(init.hsl_display_width > 0)
    {
      self.hsl_disp = new HSLDisplay(self.w,0,init.hsl_display_width,dc.height,self);
    }

    self.colorblind_mode = false;
    if(init.colorblind)
    {
      self.colorblind_button = new ButtonBox(dc.width-30,dc.height-30,20,20,function(){ self.colorblind_mode = !self.colorblind_mode; })
      presser.register(self.colorblind_button);
    }

    self.ticks_outside = 100000; //"it's been outside forever"
    self.ticks_playing = 0;
    self.ticks_initialized = 0;

    self.ifor = function(col,row) { col = (col+self.cols)%self.cols; row = (row+self.rows)%self.rows; return row*self.cols+col; };

    var n_a;
    var n_b;
    for(var i = 0; i < self.rows; i++)
    {
      for(var j = 0; j < self.cols; j++)
      {
        n_a = new Node(init);
        n_a.setPos(j,i,self.cols,self.rows,self);
        n_a.setType(NODE_TYPE_NONE);
        n_b = new Node(init);
        n_b.clone(n_a);
        self.nodes_a.push(n_a);
        self.nodes_b.push(n_b);
      }
    }

    self.reset = function()
    {
      if(init.allow_reset)
      {
        self.prerequisite_met = false;
        grid.clear();
        if(init.init_badb)
        {
          var n = self.nodeAt(floor(self.cols/3),floor(self.rows/3));
          n.setType(NODE_TYPE_BADB);
          n.biot_resist = init.default_badb_resist;
          if(init.colored_hsl)
          {
            n.h = init.default_h;
            HSL2RGB(n,n);
          }
          else if(init.colored_rgb)
          {
            n.r = init.default_r;
            n.g = init.default_g;
            n.b = init.default_b;
          }
          n.parent_node = undefined;
          self.n_badb = 1;
        }
        else self.n_badb = 0;

        if(init.init_good)
        {
          var n = self.nodeAt(floor(self.cols/3*2),floor(self.rows/3));
          n.setType(NODE_TYPE_GOOD);
          n.biot_resist = init.default_good_resist;
          if(init.colored_hsl)
          {
            n.h = init.default_h;
            HSL2RGB(n,n);
          }
          else if(init.colored_rgb)
          {
            n.r = init.default_r;
            n.g = init.default_g;
            n.b = init.default_b;
          }
          n.parent_node = undefined;
          self.n_good = 1;
        }
        else self.n_good = 0;

        if(init.allow_body && init.init_body)
        {
          var n = self.nodeAt(floor(self.cols/2),floor(self.rows/3*2))
          n.setType(NODE_TYPE_BODY);
          if(init.colored_hsl)
          {
            n.h = init.default_h;
            HSL2RGB(n,n);
          }
          else if(init.colored_rgb)
          {
            n.r = init.default_r;
            n.g = init.default_g;
            n.b = init.default_b;
          }
          n.parent_node = undefined;
          self.n_body = 1;
        }
        else self.n_body = 0;
      }
      self.n_nodes = self.n_badb + self.n_good + self.n_body;
    }

    self.nodeAt = function(col,row)
    {
      return self.node_buffs[self.node_buff][self.ifor(col,row)];
    }
    self.nodeAtCanv = function(x,y)
    {
      x = floor(((x-self.x)/self.w)*self.cols);
      y = floor(((y-self.y)/self.h)*self.rows);
      return self.nodeAt(x,y);
    }

    self.clear = function()
    {
      var nodes = self.node_buffs[self.node_buff];
      for(var i = 0; i < nodes.length; i++)
        nodes[i].setType(NODE_TYPE_NONE);
    }

    self.dose = function(amt)
    {
      var nodes = self.node_buffs[self.node_buff];
      for(var i = 0; i < nodes.length; i++)
      {
        var n = nodes[i];
        if(init.dose_chip_damage)
        {
          if(rand() * amt > n.biot_resist)
            n.setType(NODE_TYPE_NONE);
        }
        else
        {
          if(amt > n.biot_resist)
            n.setType(NODE_TYPE_NONE);
        }
      }
    }

    self.tick = function()
    {
      //gauge whether appropriate to continue
      if(platform == "PC") //based on hover
      {
        if(self.hovering) self.ticks_outside = 0;
        else              self.ticks_outside++;
      }
      else if(platform == "MOBILE") //based on screen pos
      {
        var rect = hoverer.source.getBoundingClientRect();
        var onScreen = rect.top < window.innerHeight && 0 < rect.top + rect.height;
        if(onScreen) self.ticks_outside = 0;
        else         self.ticks_outside++;
      }

      if(init.display_pause && self.ticks_outside > 10) { self.ticks_playing = 0; return; }
      else                                              { self.ticks_playing++;           }

      var old_nodes = self.node_buffs[self.node_buff];
      self.node_buff = (self.node_buff+1)%2;
      var new_nodes = self.node_buffs[self.node_buff];
      //correct pointers for new buff
      if(self.hovering_node) self.hovering_node = self.nodeAt(self.hovering_node.col,self.hovering_node.row);
      if(self.dragging_node) self.dragging_node = self.nodeAt(self.dragging_node.col,self.dragging_node.row);

      //clone buff
      for(var i = 0; i < new_nodes.length; i++)
        new_nodes[i].cloneMutables(old_nodes[i]);
      //tick buff
      for(var i = 0; i < new_nodes.length; i++)
        new_nodes[i].tick();

      //tick full grid (inter-node)
      for(var r = 0; r < self.rows; r++)
      {
        for(var c = 0; c < self.cols; c++)
        {
          var i = self.ifor(c,r);
          var on = old_nodes[i];
          var nn = new_nodes[i];
          switch(on.type)
          {
            case NODE_TYPE_BADB:
            case NODE_TYPE_GOOD:
              if(init.age && on.age > 500) nn.setType(NODE_TYPE_NONE);
              break;
            case NODE_TYPE_BODY:
              if(init.age && on.age > 2000) nn.setType(NODE_TYPE_NONE);
              break;
            case NODE_TYPE_NONE:
              if(!init.reproduce) break;

              var n_badb = 0;
              var n_good = 0;

              var token_badb = undefined;
              var token_good = undefined;
              var token_node = undefined;

              n = old_nodes[self.ifor(c-1,r)]; if(n.type == NODE_TYPE_BADB) { n_badb++; if(rand() < 1/n_badb) token_badb = n; } else if(n.type == NODE_TYPE_GOOD) { n_good++; if(rand() < 1/n_good) token_good = n; }
              n = old_nodes[self.ifor(c,r-1)]; if(n.type == NODE_TYPE_BADB) { n_badb++; if(rand() < 1/n_badb) token_badb = n; } else if(n.type == NODE_TYPE_GOOD) { n_good++; if(rand() < 1/n_good) token_good = n; }
              n = old_nodes[self.ifor(c+1,r)]; if(n.type == NODE_TYPE_BADB) { n_badb++; if(rand() < 1/n_badb) token_badb = n; } else if(n.type == NODE_TYPE_GOOD) { n_good++; if(rand() < 1/n_good) token_good = n; }
              n = old_nodes[self.ifor(c,r+1)]; if(n.type == NODE_TYPE_BADB) { n_badb++; if(rand() < 1/n_badb) token_badb = n; } else if(n.type == NODE_TYPE_GOOD) { n_good++; if(rand() < 1/n_good) token_good = n; }

              if(n_badb + n_good == 0) break;

              var chance = 0.01;
              var not_chance = 1-chance;
              var badb_spawn_chance = 0;
              var good_spawn_chance = 0;
              var should_spawn_badb = false;
              var should_spawn_good = false;
              if(n_badb > 0)
              {
                badb_spawn_chance = 1-pow(not_chance,n_badb*init.sim_speed);
                should_spawn_badb = (rand() < badb_spawn_chance);
              }
              if(n_good > 0)
              {
                good_spawn_chance = 1-pow(not_chance,n_good*init.sim_speed);
                should_spawn_good = (rand() < good_spawn_chance);
              }

              if(should_spawn_badb && !should_spawn_good) token_node = token_badb;
              if(should_spawn_good && !should_spawn_badb) token_node = token_good;
              if(should_spawn_good && should_spawn_badb)
              {
                if(rand() < 0.5) token_node = token_badb;
                else token_node = token_good;
              }

              if(token_node)
              {
                new_nodes[i].parent_node = token_node;
                new_nodes[i].setType(token_node.type);
                var biot_resist = token_node.biot_resist;
                var hc = token_node.h;
                var rc = token_node.r;
                var gc = token_node.g;
                var bc = token_node.b;
                if(init.mutate_rate)
                {
                  if(init.mutate_random_assign && rand() < init.mutate_rate)
                  {
                    if(rand < init.mutate_random_assign)
                    {
                      biot_resist = rand();
                      if(init.colored_rgb)
                      {
                        rc = rand();
                        gc = rand();
                        bc = rand();
                      }
                      if(init.colored_hsl)
                      {
                        hc = rand()*360;
                      }
                    }
                  }
                  else if(init.mutate_distance)
                  {
                    if(init.colored_rgb)
                    {
                           if(rand < init.mutate_rate*0.5)   rc -= rand()*init.mutate_distance;
                      else if(rand > 1-init.mutate_rate*0.5) rc += rand()*init.mutate_distance;
                           if(rand < init.mutate_rate*0.5)   gc -= rand()*init.mutate_distance;
                      else if(rand > 1-init.mutate_rate*0.5) gc += rand()*init.mutate_distance;
                           if(rand < init.mutate_rate*0.5)   bc -= rand()*init.mutate_distance;
                      else if(rand > 1-init.mutate_rate*0.5) bc += rand()*init.mutate_distance;
                    }
                    else if(init.colored_hsl)
                    {
                           if(rand < init.mutate_rate*0.5)   hc -= rand()*init.mutate_distance*180;
                      else if(rand > 1-init.mutate_rate*0.5) hc += rand()*init.mutate_distance*180;
                    }
                    else
                    {
                      if(init.bias_mutate)
                      {
                             if(rand < init.mutate_rate*0.4)   biot_resist -= rand()*init.mutate_distance;
                        else if(rand > 1-init.mutate_rate*0.6) biot_resist += rand()*init.mutate_distance;
                      }
                      else
                      {
                             if(rand < init.mutate_rate*0.5)   biot_resist -= rand()*init.mutate_distance;
                        else if(rand > 1-init.mutate_rate*0.5) biot_resist += rand()*init.mutate_distance;
                      }
                    }
                  }
                }

                if(init.colored_rgb)
                {
                  if(rc < 0) rc = 0; else if(rc > 1) rc = 1; else new_nodes[i].r = rc;
                  if(gc < 0) gc = 0; else if(gc > 1) gc = 1; else new_nodes[i].g = gc;
                  if(bc < 0) bc = 0; else if(bc > 1) bc = 1; else new_nodes[i].b = bc;
                }
                else if(init.colored_hsl)
                {
                  while(hc < 0) hc += 360;
                  while(hc > 360) hc -= 360;
                  new_nodes[i].h = hc;
                  HSL2RGB(new_nodes[i],new_nodes[i]);
                }
                if(biot_resist < 0) biot_resist = 0;
                else if(biot_resist > 1) biot_resist = 1;
                new_nodes[i].biot_resist = biot_resist;
                new_nodes[i].health = biot_resist;
              }

              break;
          }
        }
      }

      //tick full grid (outer-node)
      for(var r = 0; r < self.rows; r++)
      {
        for(var c = 0; c < self.cols; c++)
        {
          var i = self.ifor(c,r);
          var on = old_nodes[i];
          var nn = new_nodes[i];

          var reprod = 0;

          switch(on.type)
          {
            case NODE_TYPE_BADB:
            case NODE_TYPE_GOOD:
            case NODE_TYPE_BODY:
            case NODE_TYPE_NONE:
              break;
          }

          if(on.type == NODE_TYPE_BODY && !on.body_resist)
          {
            nn = new_nodes[self.ifor(c-1,r)]; if(nn.type == NODE_TYPE_BADB) { reprod = 1; nn.setType(NODE_TYPE_BODY); }
            nn = new_nodes[self.ifor(c,r-1)]; if(nn.type == NODE_TYPE_BADB) { reprod = 1; nn.setType(NODE_TYPE_BODY); }
            nn = new_nodes[self.ifor(c+1,r)]; if(nn.type == NODE_TYPE_BADB) { reprod = 1; nn.setType(NODE_TYPE_BODY); }
            nn = new_nodes[self.ifor(c,r+1)]; if(nn.type == NODE_TYPE_BADB) { reprod = 1; nn.setType(NODE_TYPE_BODY); }
            if(reprod) nn = new_nodes[i]; nn.setType(NODE_TYPE_NONE);
          }
        }
      }

      //tick aux stuff
      if(init.allow_dose_slider && self.dosing_prog)
      {
        self.dose(self.dosing_prog);
        self.dosing_prog += self.dosing_prog_rate;
        if(self.dosing_prog > self.dose_amt)
          self.dosing_prog = 0;
      }
      else if(init.allow_dose_button && self.dosing_prog)
      {
        self.dose(self.dosing_prog);
        self.dosing_prog = 0;
      }
      if(init.allow_sim_speed_slider) self.simspeed_slider.tick();
      if(init.allow_dose_slider)      self.dose_slider.tick();
      if(init.reinit_badb && self.n_badb == 0)
      {
        self.nodeAt(floor(self.cols/3),floor(self.rows/3)).setType(NODE_TYPE_BADB);
        self.nodeAt(floor(self.cols/3),floor(self.rows/3)).biot_resist = init.default_badb_resist;
      }
      if(init.reinit_good && self.n_good == 0)
      {
        self.nodeAt(floor(self.cols/3*2),floor(self.rows/3)).setType(NODE_TYPE_GOOD);
        self.nodeAt(floor(self.cols/3*2),floor(self.rows/3)).biot_resist = init.default_good_resist;
      }
      if(init.allow_body && init.reinit_body && self.n_body == 0)
      {
        self.nodeAt(floor(self.cols/2),floor(self.rows/3*2)).setType(NODE_TYPE_BODY);
      }

      //gather stats
      self.n_nodes = 0;
      self.n_badb = 0; self.ave_badb_biot_resist = 0;
      self.n_good = 0; self.ave_badb_biot_resist = 0;
      self.n_body = 0; self.ave_badb_biot_resist = 0;
      self.n_r = 0;
      self.n_g = 0;
      self.n_b = 0;
      for(var i = 0; i < new_nodes.length; i++)
      {
        var n = new_nodes[i];
             if(n.type == NODE_TYPE_BADB) { if(init.colored_rgb) { if(n.r > n.g && n.r > n.b) self.n_r++; else if(n.g > n.r && n.g > n.b) self.n_g++; else if(n.b > n.r && n.b > n.g) self.n_b++; } self.n_badb++; self.ave_badb_biot_resist += n.biot_resist; }
        else if(n.type == NODE_TYPE_GOOD) { if(init.colored_rgb) { if(n.r > n.g && n.r > n.b) self.n_r++; else if(n.g > n.r && n.g > n.b) self.n_g++; else if(n.b > n.r && n.b > n.g) self.n_b++; } self.n_good++; self.ave_good_biot_resist += n.biot_resist; }
        else if(n.type == NODE_TYPE_BODY) { self.n_body++; self.ave_body_biot_resist += n.biot_resist; }
      }
      self.n_nodes = self.n_badb + self.n_good + self.n_body;
      if(self.n_badb > 0) self.ave_badb_biot_resist /= self.n_badb;
      if(self.n_good > 0) self.ave_good_biot_resist /= self.n_good;
      if(self.n_body > 0) self.ave_body_biot_resist /= self.n_body;

      if(init.prerequisite_fill_for_interaction == 0 || self.n_nodes == 0 || self.n_nodes >= init.prerequisite_fill_for_interaction*self.rows*self.cols)
        self.prerequisite_met = true;
      if(self.prerequisite_met) self.ticks_initialized++;
      else                      self.ticks_initialized = 0;

      //handle hovering
      if(self.hovering_node && self.prerequisite_met)
      {
        var n;
        switch(init.hover_function)
        {
          case CLICK_FUNC_KILL:
            self.hovering_node.setType(NODE_TYPE_NONE);
            self.hovering_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row-1); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row+1); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col-1,self.hovering_node.row); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col+1,self.hovering_node.row); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_DAMG:
            self.hovering_node.health -= 0.3;
            if(self.hovering_node.health <= 0)
            {
              self.hovering_node.setType(NODE_TYPE_NONE);
              self.hovering_node.parent_node = undefined;
            }
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row-1); n.health -= 0.2; if(n.health <= 0) { n.setType(NODE_TYPE_NONE); n.parent_node = undefined; }
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row+1); n.health -= 0.2; if(n.health <= 0) { n.setType(NODE_TYPE_NONE); n.parent_node = undefined; }
              n = self.nodeAt(self.hovering_node.col-1,self.hovering_node.row); n.health -= 0.2; if(n.health <= 0) { n.setType(NODE_TYPE_NONE); n.parent_node = undefined; }
              n = self.nodeAt(self.hovering_node.col+1,self.hovering_node.row); n.health -= 0.2; if(n.health <= 0) { n.setType(NODE_TYPE_NONE); n.parent_node = undefined; }
            }
            break;
          case CLICK_FUNC_BADB:
            self.hovering_node.setType(NODE_TYPE_BADB);
            if(init.colored_hsl)
            {
              self.hovering_node.h = init.default_h;
              HSL2RGB(self.hovering_node,self.hovering_node);
            }
            else if(init.colored_rgb)
            {
              self.hovering_node.r = init.default_r;
              self.hovering_node.g = init.default_g;
              self.hovering_node.b = init.default_b;
            }
            self.hovering_node.biot_resist = init.default_badb_resist;
            self.hovering_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row-1); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row+1); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col-1,self.hovering_node.row); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col+1,self.hovering_node.row); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_GOOD:
            self.hovering_node.setType(NODE_TYPE_GOOD);
            if(init.colored_hsl)
            {
              self.hovering_node.h = init.default_h;
              HSL2RGB(self.hovering_node,self.hovering_node);
            }
            else if(init.colored_rgb)
            {
              self.hovering_node.r = init.default_r;
              self.hovering_node.g = init.default_g;
              self.hovering_node.b = init.default_b;
            }
            self.hovering_node.biot_resist = init.default_good_resist;
            self.hovering_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row-1); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row+1); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col-1,self.hovering_node.row); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col+1,self.hovering_node.row); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_BODY:
            self.hovering_node.setType(NODE_TYPE_BODY);
            if(init.colored_hsl)
            {
              self.hovering_node.h = init.default_h;
              HSL2RGB(self.hovering_node,self.hovering_node);
            }
            else if(init.colored_rgb)
            {
              self.hovering_node.r = init.default_r;
              self.hovering_node.g = init.default_g;
              self.hovering_node.b = init.default_b;
            }
            self.hovering_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row-1); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col,self.hovering_node.row+1); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col-1,self.hovering_node.row); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.hovering_node.col+1,self.hovering_node.row); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_NONE:
          default:
            break;
        }
      }

      //handle dragging
      if(self.dragging_node && self.prerequisite_met)
      {
        switch(init.click_function)
        {
          case CLICK_FUNC_KILL:
            self.dragging_node.setType(NODE_TYPE_NONE);
            self.dragging_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row-1); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row+1); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col-1,self.dragging_node.row); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col+1,self.dragging_node.row); n.setType(NODE_TYPE_NONE); n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_DAMG:
            self.dragging_node.health -= 0.1;
            if(self.dragging_node.health <= 0)
            {
              self.dragging_node.setType(NODE_TYPE_NONE);
              self.dragging_node.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_BADB:
            self.dragging_node.setType(NODE_TYPE_BADB);
            if(init.colored_hsl)
            {
              self.dragging_node.h = init.default_h;
              HSL2RGB(self.dragging_node,self.dragging_node);
            }
            else if(init.colored_rgb)
            {
              self.dragging_node.r = init.default_r;
              self.dragging_node.g = init.default_g;
              self.dragging_node.b = init.default_b;
            }
            self.dragging_node.biot_resist = init.default_badb_resist;
            self.dragging_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row-1); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row+1); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col-1,self.dragging_node.row); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col+1,self.dragging_node.row); n.setType(NODE_TYPE_BADB); n.biot_resist = init.default_badb_resist; n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_GOOD:
            self.dragging_node.setType(NODE_TYPE_GOOD);
            if(init.colored_hsl)
            {
              self.dragging_node.h = init.default_h;
              HSL2RGB(self.dragging_node,self.dragging_node);
            }
            else if(init.colored_rgb)
            {
              self.dragging_node.r = init.default_r;
              self.dragging_node.g = init.default_g;
              self.dragging_node.b = init.default_b;
            }
            self.dragging_node.biot_resist = init.default_good_resist;
            self.dragging_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row-1); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row+1); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col-1,self.dragging_node.row); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col+1,self.dragging_node.row); n.setType(NODE_TYPE_GOOD); n.biot_resist = init.default_good_resist; n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_BODY:
            self.dragging_node.setType(NODE_TYPE_BODY);
            if(init.colored_hsl)
            {
              self.dragging_node.h = init.default_h;
              HSL2RGB(self.dragging_node,self.dragging_node);
            }
            else if(init.colored_rgb)
            {
              self.dragging_node.r = init.default_r;
              self.dragging_node.g = init.default_g;
              self.dragging_node.b = init.default_b;
            }
            self.dragging_node.parent_node = undefined;
            if(init.swab_size > 1)
            {
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row-1); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col,self.dragging_node.row+1); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col-1,self.dragging_node.row); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
              n = self.nodeAt(self.dragging_node.col+1,self.dragging_node.row); n.setType(NODE_TYPE_BODY); n.parent_node = undefined;
            }
            break;
          case CLICK_FUNC_NONE:
          default:
            break;
        }
      }
    }

    self.draw = function()
    {
      var nodes = self.node_buffs[self.node_buff];
      ctx.lineWidth = nodes[0].w/8;
      for(var i = 0; i < nodes.length; i++)
        nodes[i].draw(dc,false,true);
      ctx.lineWidth = 2;
      if(!init.colorblind || !scene.colorblind_mode)
      {
        for(var i = 0; i < nodes.length; i++)
          nodes[i].draw(dc,false,false);
      }
      else
      {
        for(var i = 0; i < nodes.length; i++)
        {
          if(init.colored_hsl && nodes[i].h > 90 && nodes[i].h < 150)
            nodes[i].draw(dc,true,false);
          else if(init.colored_rgb && nodes[i].g > nodes[i].r && nodes[i].g > nodes[i].b)
            nodes[i].draw(dc,true,false);
          else
            nodes[i].draw(dc,false,false);
        }
      }

      ctx.strokeStyle = "#0000FF";
      if(init.show_hover && self.hovering_node && scene.prerequisite_met)
      {
        if(init.swab_size == 1)
        {
          ctx.strokeRect(self.hovering_node.x,self.hovering_node.y,self.hovering_node.w,self.hovering_node.height);
        }
        else
        {
          ctx.strokeRect(self.hovering_node.x-self.hovering_node.w,self.hovering_node.y,self.hovering_node.w*3,self.hovering_node.height);
          ctx.strokeRect(self.hovering_node.x,self.hovering_node.y-self.hovering_node.height,self.hovering_node.w,self.hovering_node.height*3);
        }
      }

      if(self.n_nodes == 0)
      {
        ctx.drawImage(plus_img,self.w/2-20,self.h/2-20-30,40,40);
        ctx.font = "20px Open Sans";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText("CLICK TO ADD BACTERIA",self.w/2,self.h/2+30);
      }

      if(init.allow_sim_speed_slider)
      {
        self.simspeed_slider.draw(dc);
      }
      if(init.allow_dose_slider)
      {
        ctx.strokeStyle = "#00FF00";
        self.dose_button.draw(dc);
        ctx.strokeStyle = "#00FF00";
        self.dose_slider.draw(dc);

        //fill slider with color exterminating
        var r = floor((1-self.dose_amt)*255);
        ctx.fillStyle = "rgba("+r+","+r+","+r+",1)";
        var switch_x = self.dose_slider.slit_x+(((self.dose_slider.val-self.dose_slider.min_val)/(self.dose_slider.max_val-self.dose_slider.min_val))*self.dose_slider.slit_w);
        ctx.fillRect(switch_x-(self.dose_slider.w/20)+0.5,self.dose_slider.y+0.5,(self.dose_slider.w/10),self.dose_slider.h);
      }
      else if(init.allow_dose_button)
      {
        ctx.font = "20px Open Sans";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.fillText("dose antibiotic",self.dose_button.x+self.dose_button.w+5,self.dose_button.y+self.dose_button.h-2);
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.arc(self.dose_button.x+self.dose_button.w/2,self.dose_button.y+self.dose_button.h/2-3,self.dose_button.w/2,0,2*pi);
        ctx.stroke();
        if(self.dose_button.down)
        {
          ctx.fillStyle = "#000000";
          ctx.fill();
        }
      }
      if(init.allow_reset)
      {
        ctx.font = "20px Open Sans";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "right";
        ctx.fillText("reset",self.reset_button.x+self.reset_button.w,self.reset_button.y+self.reset_button.h-2);
        ctx.strokeStyle = "#000000";
        ctx.textAlign = "left";
      }
      if(init.ave_display_width > 0)
      {
        self.ave_disp.draw(dc);
      }
      if(init.split_display_width > 0)
      {
        self.split_disp.draw(dc);
      }
      if(init.tricolor_display_width > 0)
      {
        self.tricolor_disp.draw(dc);
      }
      if(init.hsl_display_width > 0)
      {
        self.hsl_disp.draw(dc);
      }

      if(init.allow_contaminate)
      {
        self.sneeze_button.draw(dc);
        self.catch_button.draw(dc);
      }

      if(init.allow_dose_slider && self.dosing_prog)
      {
        ctx.strokeStyle = "#00FF00";
        ctx.strokeRect(self.dose_slider.x+(self.dosing_prog*self.dose_slider.w),self.dose_slider.y,2,20);
      }

      if(init.colorblind)
      {
        self.colorblind_button.draw(dc);
      }

      if(init.display_pause && self.ticks_playing == 0)
      {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(self.x,self.y,self.w,self.h);

        var w = self.w;
        ctx.fillStyle = "white";
        ctx.strokeStyle = DARK_COLOR;
        ctx.fillRect(w-28,10,8,20);
        ctx.strokeRect(w-28,10,8,20);
        ctx.fillRect(w-18,10,8,20);
        ctx.strokeRect(w-18,10,8,20);
      }
      else
      {
        if(init.display_pause && self.ticks_playing < 30)
        {
          var w = self.w;
          ctx.fillStyle = "white";
          ctx.strokeStyle = DARK_COLOR;
          ctx.beginPath();
          ctx.moveTo(w-10, 20);
          ctx.lineTo(w-25, 30);
          ctx.lineTo(w-25, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        if(init.prompt_prerequisite_unmet && self.ticks_initialized == 0)
        {
          ctx.fillStyle = DARK_COLOR;
          ctx.font = "12px Helvetica Neue";
          ctx.fillText("Waiting for population to grow...",round(self.w/2-100),round(dc.height-50));
        }
        else if(init.prompt_prerequisite_unmet && self.ticks_initialized < 30)
        {
          ctx.fillStyle = DARK_COLOR;
          ctx.font = "12px Helvetica Neue";
          ctx.fillText("Begin!",round(self.w/2-100),round(dc.height-50));
        }
      }

      if(init.prompt_reset_on_empty && (self.n_badb + self.n_good + self.n_body) == 0)
      {
        ctx.fillStyle = DARK_COLOR;
        ctx.font = "12px Helvetica Neue";
        ctx.fillText("Reset to add bacteria "+String.fromCharCode(8595),round(self.w/2-60),round(dc.height-50));
      }

      /*
      //for more visible debugging overlay
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0,0,dc.width,dc.height/2);
      */
    }

    self.hovering = false;
    self.hovering_node = undefined;
    self.hover = function(evt)
    {
      self.hovering = true;
      self.hovering_node = self.nodeAtCanv(evt.doX,evt.doY);
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
      self.hovering_node = undefined;
    }
    self.dragging = false;
    self.dragStart = function(evt)
    {
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      self.dragging_node = self.nodeAtCanv(evt.doX,evt.doY);
    }
    self.dragFinish = function()
    {
      self.dragging = false;
      self.dragging_node = undefined;
    }

  };

  self.ready = function()
  {
    presser = new Presser({source:stage.dispCanv.canvas});
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});

    grid = new Grid({},self);
    grid.reset();
    hoverer.register(grid);
    dragger.register(grid);
  };

  self.tick = function()
  {
    hoverer.flush();
    presser.flush();
    dragger.flush();

    for(var i = 0; i < 1; i++)
      grid.tick();
  }
  self.draw = function()
  {
    grid.draw();
  }

  self.cleanup = function()
  {
  };

};

