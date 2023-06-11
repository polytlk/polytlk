"""Module to load NLP model, preventing download on container restart."""
import hanlp

# tok models https://hanlp.hankcs.com/docs/api/hanlp/pretrained/tok.html
# TRIED hanlp.pretrained.tok.LARGE_ALBERT_BASE                      NEED FULL
# TRIED hanlp.pretrained.tok.CTB6_CONVSEG                           NEED FULL
# TRIED hanlp.pretrained.tok.PKU_NAME_MERGED_SIX_MONTHS_CONVSEG     NEED FULL
# TRIED hanlp.pretrained.tok.SIGHAN2005_PKU_CONVSEG                 NEED FULL
# TRIED hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH
# TRIED hanlp.pretrained.tok.MSR_TOK_ELECTRA_BASE_CRF
# TRIED hanlp.pretrained.tok.FINE_ELECTRA_SMALL_ZH
model = hanlp.load(hanlp.pretrained.tok.UD_TOK_MMINILMV2L12)
