package arcs

// TODO: This needs to be autogenerated by a schema2kotlin utility
// Current implementation doesn't support optional field detection
data class Data(
    var num_: Double = 0.0, var txt_: String = "", var lnk_: URL = "", var flg_: Boolean = false
) : Entity<Data>() {
    override fun decodeEntity(encoded: String): Data? {
        if (encoded.isEmpty()) {
            return null
        }
        val decoder = StringDecoder(encoded)
        this.internalId = decoder.decodeText()
        decoder.validate("|")
        var i = 0
        while (!decoder.done() && i < 4) {
            val name = decoder.upTo(":")
            when (name) {
                "num" -> {
                    decoder.validate("N")
                    num_ = decoder.decodeNum()
                }
                "txt" -> {
                    decoder.validate("T")
                    txt_ = decoder.decodeText()
                }
                "lnk" -> {
                    decoder.validate("U")
                    lnk_ = decoder.decodeText()
                }
                "flg" -> {
                    decoder.validate("B")
                    flg_ = decoder.decodeBool()
                }
            }
            decoder.validate("|")
            i++
        }
        return this
    }

    override fun encodeEntity(): String {
        val encoder = StringEncoder()
        encoder.encode("", internalId)
        encoder.encode("num:N", num_)
        encoder.encode("txt:T", txt_)
        encoder.encode("lnk:U", lnk_)
        encoder.encode("flg:B", flg_)
        return encoder.result()
    }
}


data class Info(var for_: String = "", var val_: Double = 0.0) : Entity<Info>() {
    override fun decodeEntity(encoded: String): Info? {
        if (encoded.isEmpty()) {
            return null
        }
        val decoder = StringDecoder(encoded)
        this.internalId = decoder.decodeText()
        decoder.validate("|")
        var i = 0
        while (!decoder.done() && i < 2) {
            val name = decoder.upTo(":")
            when (name) {
                "for" -> {
                    decoder.validate("T")
                    for_ = decoder.decodeText()
                }
                "val" -> {
                    decoder.validate("N")
                    val_ = decoder.decodeNum()
                }
            }
            decoder.validate("|")
            i++
        }
        return this
    }

    override fun encodeEntity(): String {
        val encoder = StringEncoder()
        encoder.encode("", internalId)
        encoder.encode("for:T", for_)
        encoder.encode("val:N", val_)
        return encoder.result()
    }
}