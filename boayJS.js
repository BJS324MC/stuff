class BQuery{
    constructor(a){
        if(typeof a === 'function')return window.addEventListener('load',a);
        this.eles=[];
        let col=(a[0]=='.') ? document.getElementsByClassName(a.slice(1)):(a[0]=='#') ? [document.getElementById(a.slice(1))]:document.getElementsByTagName(a);
        for(let ele of col)this.eles.push(ele);
    }
    attr(attr,val){
        for(let ele of this.eles)if(val!=null)ele.setAttribute(attr,val);
        let attrs=[];
        for(let ele of this.eles)attrs.push(ele.getAttribute(attr));
        return attrs;
    }
    html(val){
        for(let ele of this.eles)if(val!=null)ele.innerHTML=val;
        val=[];
        for(let ele of this.eles)val.push(ele.innerHTML);
        return val;
    }
    text(val){
        for(let ele of this.eles){
            if(val!=null)ele.textContent=val;
        };
        val=[];
        for(let ele of this.eles)val.push(ele.textContent);
        return val;
    }
    children(){
        let children=[],arr=[];
        for(let ele of this.eles)for(let E of ele.children)children.push(S(E.tagName.toLowerCase()));
        return children;
    }
    append(html){
        for(let ele of this.eles)ele.innerHTML+=html;
        return html;
    }
    prepend(html){
        for(let ele of this.eles)ele.innerHTML=html+ele.innerHTML;
        return html;
    }
    remove(filter=e=>true){
        for(let ele of this.eles)if(filter(ele))ele.remove();
    }
    on(e,f){
        for(let ele of this.eles)ele.addEventListener(e,f);
    }
    click(f){
        for(let ele of this.eles)ele.addEventListener('click',f);
    }
    hover(f,g){
        for(let ele of this.eles)ele.addEventListener('mouseenter',f);
        for(let ele of this.eles)ele.addEventListener('mouseout',g);
    }
    out(f){
        for(let ele of this.eles)ele.addEventListener('mouseout',f);
    }
    hide(){
        for(let ele of this.eles)ele.style.display='none';
    }
    show(){
        for(let ele of this.eles)ele.style.display='block';
    }
    toggle(){
        for(let ele of this.eles)ele.style.display=ele.style.display=='none' ? 'block':'none';;
    }
    css(sel,v){
        if(typeof sel === "object"){
            for(let ele of this.eles)for(let i in sel)ele.style[i]=sel[i];
        }else if(sel && v){
            for(let ele of this.eles)ele.style[sel]=v;
        };
        v=[];
        for(let ele of this.eles)v.push(getComputedStyle(ele));
        return v;
    }
    filter(f){
        let fill=[];
        for(let ele of this.eles)if(f(ele))fill.push(S(ele.tagName.toLowerCase()));//[this.eles.indexOf(ele)]
        return fill;
    }
};
const S=(a)=>new BQuery(a);
