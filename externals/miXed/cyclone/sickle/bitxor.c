/* Copyright (c) 2002-2003 krzYszcz and others.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.  */

/* FIXME find a way of setting a 32-bit mask in an argument */

#include <string.h>
#include "m_pd.h"
#include "unstable/forky.h"
#include "sickle/sic.h"

#define PDCYBITMASK 0
#define PDCYOPMODE 0
typedef struct _bitxor
{
    t_sic     x_sic;
    t_glist  *x_glist;
    t_int     x_mask;  /* set by a 'bits' message or a creation argument */
    int       x_mode;
    int       x_convert1;
} t_bitxor;

static t_class *bitxor_class;

static t_int *bitxor_perform(t_int *w)
{
    t_bitxor *x = (t_bitxor *)(w[1]);
    int nblock = (int)(w[2]);
    t_float *in1 = (t_float *)(w[3]);
    t_float *in2 = (t_float *)(w[4]);
    t_float *out = (t_float *)(w[5]);
    t_int mask = x->x_mask;
    switch (x->x_mode)
    {
	/* LATER think about performance */
    case 0:
	/* CHECKED */
	while (nblock--)
	{
	    t_int i = ((*(t_int *)(t_float *)in1++) ^
		       (*(t_int *)(t_float *)in2++));
	    *out++ = *(t_float *)&i;
	}
	break;
    case 1:
	/* CHECKED */
	while (nblock--)
	{
	    t_int i = (((t_int)*in1++) ^
		       ((t_int)*in2++));
	    *out++ = (t_float)i;
	}
	break;
    case 2:
	/* CHECKED */
	while (nblock--)
	{
	    t_int i = (*(t_int *)(t_float *)in1++) ^ ((t_int)*in2++);
	    *out++ = *(t_float *)&i;
	}
	break;
    case 3:
	/* CHECKED */
	while (nblock--)
	{
	    t_int i = ((t_int)*in1++) ^ (*(t_int *)(t_float *)in2++);
	    *out++ = (t_float)i;
	}
	break;
    }
    return (w + 6);
}

static t_int *bitxor_perform_noin2(t_int *w)
{
    t_bitxor *x = (t_bitxor *)(w[1]);
    int nblock = (int)(w[2]);
    t_float *in = (t_float *)(w[3]);
    t_float *out = (t_float *)(w[4]);
    t_int mask = x->x_mask;
    /* LATER think about performance */
    if (x->x_convert1) while (nblock--)
    {
	/* CHECKED */
	t_int i = ((t_int)*in++) ^ mask;
	*out++ = (t_float)i;
    }
    else while (nblock--)
    {
	/* CHECKED */
	t_int i = (*(t_int *)(t_float *)in++) ^ mask;
	*out++ = *(t_float *)&i;
    }
    return (w + 5);
}

static void bitxor_dsp(t_bitxor *x, t_signal **sp)
{
    if (forky_hasfeeders((t_object *)x, x->x_glist, 1, 0))
	/* use the mask set by a second inlet's signal or float,
	   CHECKED (incompatible) second inlet's int is persistent */
	dsp_add(bitxor_perform, 5, x, (t_int)sp[0]->s_n, sp[0]->s_vec,
		sp[1]->s_vec, sp[2]->s_vec);
    else  /* use the mask set by a 'bits' message or a creation argument */
	dsp_add(bitxor_perform_noin2, 4, x, (t_int)sp[0]->s_n, sp[0]->s_vec,
		sp[1]->s_vec);
}

static void bitxor_bits(t_bitxor *x, t_symbol *s, int ac, t_atom *av)
{
    x->x_mask = forky_getbitmask(ac, av);
}

static void bitxor_mode(t_bitxor *x, t_floatarg f)
{
    int i = (int)f;
    if (i < 0)
	i = 0;  /* CHECKED */
    else if (i > 3)
	i = 3;  /* CHECKED */
    x->x_mode = i;
    x->x_convert1 = (x->x_mode == 1 || x->x_mode == 3);
}

static void *bitxor_new(t_symbol *s, int argc, t_atom *argv)
{
    t_bitxor *x = (t_bitxor *)pd_new(bitxor_class);
    x->x_glist = canvas_getcurrent();
    inlet_new((t_object *)x, (t_pd *)x, &s_signal, &s_signal);
    outlet_new((t_object *)x, &s_signal);
	
	//setting defaults
	t_float xmode = (t_float)PDCYOPMODE;
	t_float xbitmask = (t_float)PDCYBITMASK;
	int argnum = 0;
	while(argc > 0){
		t_symbol *curarg = atom_getsymbolarg(0, argc, argv);
		if(curarg == &s_){//if curarg is a number
			t_float argval = atom_getfloatarg(0, argc, argv);
			switch(argnum){
				case 0:
					xbitmask = argval;
					break;
				case 1:
					xmode = argval;
					break;
				default:
					break;
			};
			argc--;
			argv++;
			argnum++;
		}
		else{//curarg is a string
			if(strcmp(curarg->s_name, "@mode")==0){
				if(argc >= 2){
					xmode = atom_getfloatarg(1, argc, argv);
					argc--;
					argv++;
				}
				else{
					goto errstate;
				}
			}
			else{
				goto errstate;
			};
		};
	};
    x->x_mask = (t_int)xbitmask;  /* FIXME (how?) */
    bitxor_mode(x, xmode);
    return (x);
	errstate:
		pd_error(x, "bitxor~: improper args");
		return NULL;

}

void bitxor_tilde_setup(void)
{
    bitxor_class = class_new(gensym("bitxor~"),
			     (t_newmethod)bitxor_new, 0,
			     sizeof(t_bitxor), 0,
			     A_GIMME, 0);
    sic_setup(bitxor_class, bitxor_dsp, SIC_FLOATTOSIGNAL);
    class_addmethod(bitxor_class, (t_method)bitxor_bits,
		    gensym("bits"), A_GIMME, 0);
    class_addmethod(bitxor_class, (t_method)bitxor_mode,
		    gensym("mode"), A_FLOAT, 0);
}
