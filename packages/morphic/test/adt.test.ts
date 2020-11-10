import * as E from "@effect-ts/core/Classic/Either"
import * as Sync from "@effect-ts/core/Sync"

import type { AType, EType } from "../src"
import { make, makeADT, opaque } from "../src"
import { decode, report } from "../src/Decoder"
import { hash } from "../src/Hash"

const Foo_ = make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("Foo"),
      foo: F.string()
    },
    {
      name: "Foo"
    }
  )
)

interface Foo extends AType<typeof Foo_> {}
interface FooRaw extends EType<typeof Foo_> {}
const Foo = opaque<FooRaw, Foo>()(Foo_)

const Bar_ = make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("Bar"),
      bar: F.string()
    },
    {
      name: "Bar"
    }
  )
)

interface Bar extends AType<typeof Bar_> {}
interface BarRaw extends EType<typeof Bar_> {}
const Bar = opaque<BarRaw, Bar>()(Bar_)

const FooBar = makeADT("_tag")({ Foo, Bar })

describe("Adt", () => {
  it("decoder", () => {
    expect(Sync.runEither(decode(FooBar)({ _tag: "Foo", foo: "foo" }))).toEqual(
      E.right<Foo>({ _tag: "Foo", foo: "foo" })
    )
    expect(Sync.runEither(decode(FooBar)({ _tag: "Bar", bar: "bar" }))).toEqual(
      E.right<Bar>({ _tag: "Bar", bar: "bar" })
    )
    expect(Sync.runEither(report(decode(FooBar)({ _tag: "Baz", baz: "baz" })))).toEqual(
      E.left([
        'Expecting TaggedUnion but instead got: {"_tag":"Baz","baz":"baz"} (Baz is not known in (Foo, Bar))'
      ])
    )
    expect(Sync.runEither(report(decode(FooBar)({ _tag: "Bar", baz: "baz" })))).toEqual(
      E.left([
        'Expecting Bar but instead got: {"_tag":"Bar","baz":"baz"} (not all the required fields are present)'
      ])
    )
  })
  it("Hashes adt", () => {
    expect(hash(FooBar).hash).toEqual(
      '{"_tag":"Bar","bar":"string"} | {"_tag":"Foo","foo":"string"}'
    )
  })
})
