"""
This module defines the specific model to be used for natural language processing tasks.

The current model in use is `hanlp.pretrained.tok.UD_TOK_MMINILMV2L12`.

This module also documents the various HanLP tokenization models that were considered and tested.
For more info on these models, visit: https://hanlp.hankcs.com/docs/api/hanlp/pretrained/tok.html

List of models tried:

- hanlp.pretrained.tok.LARGE_ALBERT_BASE                    NEED FULL
- hanlp.pretrained.tok.CTB6_CONVSEG                         NEED FULL
- hanlp.pretrained.tok.PKU_NAME_MERGED_SIX_MONTHS_CONVSEG   NEED FULL
- hanlp.pretrained.tok.SIGHAN2005_PKU_CONVSEG               NEED FULL
- hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH
- hanlp.pretrained.tok.MSR_TOK_ELECTRA_BASE_CRF
- hanlp.pretrained.tok.FINE_ELECTRA_SMALL_ZH

"""
import hanlp

HANLP_MODEL_NAME = hanlp.pretrained.tok.UD_TOK_MMINILMV2L12
