import { rotuloPagamento } from '../../../model/entities/pedido.js'
import Chip from '../Chip/Chip.jsx'

const ICONE = {
  PIX: 'pix',
  CARTAO_CREDITO: 'cartao',
  CARTAO_DEBITO: 'cartao',
  DINHEIRO: 'dinheiro',
  VOUCHER: 'voucher',
}

/** Forma de pagamento como chip com ícone: PIX em verde, demais em cinza. */
export default function ChipPagamento({ forma }) {
  return (
    <Chip tom={forma === 'PIX' ? 'verde' : 'neutro'} icone={ICONE[forma] ?? 'cartao'}>
      {rotuloPagamento(forma)}
    </Chip>
  )
}
