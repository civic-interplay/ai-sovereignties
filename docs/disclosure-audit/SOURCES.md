# Source documents

Every document the disclosure audit has read. **The files themselves are
not committed** — see `.gitignore`. A transmission planning report is 26–35 MB
and git would keep it forever.

What makes the audit reproducible is the **sha256**. Fetch the document from
its source, hash it, and if it matches you are reading the same bytes this
project read. Each audit record in `records/` carries the same hash.

```
shasum -a 256 <file>
```

| File | Size | sha256 | Retrieved |
| --- | --- | --- | --- |
| `ausgrid_dtapr_2025.pdf` | 25.0 MB | `088721f8c9fd5fffb62c45171a8dd9238c01d5b10f9f6c58ed98863a2e3e4387` | 2026-09-19 |
| `aws_permit.pdf` | 0.2 MB | `a61a72b94e642506b139db93e16f9148c3a1f8babbf49e1d78d59a84313ef883` | 2026-09-19 |
| `dalby_6397059_infrastructure_services_report.pdf` | 5.6 MB | `9203fb7b519918b1efeae46c1556c9263ad1c8d033b3562461bbc26d74aba3f7` | 2026-09-19 |
| `dalby_6408816_sara_information_request.pdf` | 0.3 MB | `74c67dea8bd1995f060d15c5f89ceefcd5d0830997f164af07381a78c6f5cdfe` | 2026-09-19 |
| `dalby_6411458_powerlink_referral_response.pdf` | 0.4 MB | `08099ace7552d8e4ce01b5d17f8040ce5f7596f349a28855246c44bae5374036` | 2026-09-19 |
| `kinloch_delegate.pdf` | 5.7 MB | `1048a930b2c137cfbcac583f0f44d89071b64f7a0a509a7eb0e817bed2085bad` | 2026-09-19 |
| `leakes171_officer_report.pdf` | 1.1 MB | `e0ce299f296a9e50b74c64d8e526a50cad6f5be35f1450f8918ee71f2c7e6e57` | 2026-09-19 |
| `perri_permit.pdf` | 0.2 MB | `ffe89a02b14f7ee3490485b87b67d9de562e84c103f508ae9608bcc1114924c3` | 2026-09-19 |
| `powerlink_tapr_2025.pdf` | 7.5 MB | `fc701077c1d4ae720ab3a967a4ee6a09fef268fc09a5657d681ee2e2196830c2` | 2026-09-19 |
| `transgrid_tapr_2026.pdf` | 33.8 MB | `5dae8e3201debe035dee8f1bb3ee67d83b8bf25b1e49255dd3e8f8cd492e1ed1` | 2026-09-19 |
