import { describe, test } from 'node:test'
import assert from 'node:assert'
import { normalize } from '../../src/main-node'
import { assertMatchCloseTo } from '../helpers'

describe(`basic tests`, () => {
  test('It should get the level `1` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
    const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
      level: 1,
    })
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      level: 1,
    })
  })

  test('It should get the level `2` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
    const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
      level: 2,
    })
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      city: '横浜市港北区',
      level: 2,
    })
  })

  test('It should get the level `3` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
    const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
      level: 3,
    })
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      city: '横浜市港北区',
      town: '大豆戸町',
      other: '17-11',
      level: 3,
    })
  })

  test('It should get the level `2` with `神奈川県横浜市港北区`', async () => {
    const res = await normalize('神奈川県横浜市港北区', {
      level: 3,
    })
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      city: '横浜市港北区',
      level: 2,
    })
  })

  test('It should get the level `1` with `神奈川県`', async () => {
    const res = await normalize('神奈川県', {
      level: 3,
    })
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      level: 1,
    })
  })

  test('It should get the level `1` with `神奈川県あいうえお市`', async () => {
    const res = await normalize('神奈川県あいうえお市')
    assertMatchCloseTo(res, {
      pref: '神奈川県',
      level: 1,
    })
  })

  test('It should get the level `2` with `東京都港区あいうえお`', async () => {
    const res = await normalize('東京都港区あいうえお')
    assertMatchCloseTo(res, {
      pref: '東京都',
      city: '港区',
      level: 2,
    })
  })

  test('It should get the level `0` with `あいうえお`', async () => {
    const res = await normalize('あいうえお')
    assertMatchCloseTo(res, {
      other: 'あいうえお',
      level: 0,
    })
  })

  describe('東京都江東区豊洲一丁目2-27 のパターンテスト', () => {
    const addresses = [
      '東京都江東区豊洲1丁目2-27',
      '東京都江東区豊洲 1丁目2-27',
      '東京都江東区豊洲 1-2-27',
      '東京都 江東区 豊洲 1-2-27',
      '東京都江東区豊洲 １ー２ー２７',
      '東京都江東区豊洲 一丁目2-27',
      '江東区豊洲 一丁目2-27',
    ]
    for (const address of addresses) {
      test(address, async () => {
        const res = await normalize(address)
        assertMatchCloseTo(res, {
          pref: '東京都',
          city: '江東区',
          town: '豊洲一丁目',
          addr: '2-27',
          level: 8,
          point: {
            lat: 35.661166758,
            lng: 139.793685144,
            level: 8,
          },
        })
      })
    }
  })

  test('東京都町田市木曽東4丁目14-イ２２ ジオロニアマンション', async () => {
    const res = await normalize(
      '東京都町田市木曽東四丁目１４ーイ２２ ジオロニアマンション',
    )
    assertMatchCloseTo(res, {
      other: '14-イ22 ジオロニアマンション',
    })
  })

  test('東京都町田市木曽東4丁目14-Ａ２２ ジオロニアマンション', async () => {
    const res = await normalize(
      '東京都町田市木曽東四丁目１４ーＡ２２ ジオロニアマンション',
    )
    assertMatchCloseTo(res, {
      other: '14-A22 ジオロニアマンション',
    })
  })

  test('東京都町田市木曽東4丁目一四━Ａ二二 ジオロニアマンション', async () => {
    const res = await normalize(
      '東京都町田市木曽東四丁目一四━Ａ二二 ジオロニアマンション',
    )
    assertMatchCloseTo(res, {
      other: '14-A22 ジオロニアマンション',
    })
  })

  test('東京都江東区豊洲 四-2-27', async () => {
    const res = await normalize('東京都江東区豊洲 四-2-27')
    assertMatchCloseTo(res, {
      town: '豊洲四丁目',
    })
  })

  describe('石川県七尾市藤橋町亥45番地1 のパターンテスト', () => {
    const addresses = [
      '石川県七尾市藤橋町亥45番地1',
      '石川県七尾市藤橋町亥四十五番地1',
      '石川県七尾市藤橋町 亥 四十五番地1',
      '石川県七尾市藤橋町 亥 45-1',
      '七尾市藤橋町 亥 45-1',
    ]
    for (const address of addresses) {
      test(address, async () => {
        const res = await normalize(address)
        assertMatchCloseTo(res, {
          pref: '石川県',
          city: '七尾市',
          town: '藤橋町亥',
          addr: '45-1',
          level: 8,
          point: {
            lat: 37.043108,
            lng: 136.967296,
            level: 2,
          },
        })
      })
    }
  })

  test('should handle unicode normalization', async () => {
    const address = `茨城県つくば市筑穂１丁目１０−４`.normalize('NFKD')
    const resp = await normalize(address)
    assert.strictEqual(resp.city, 'つくば市')
  })

  test('町丁目名が判別できなかった場合、残った住所には漢数字->数字などの変換処理を施さない', async () => {
    const res = await normalize('北海道滝川市一の坂町西')
    assert.strictEqual(res.level, 2)
    assert.strictEqual(res.town, undefined)
    assert.strictEqual(res.other, '一の坂町西')
  })

  test('丁目の数字だけあるときは正しく「一丁目」まで補充できる', async () => {
    const res = await normalize('東京都文京区小石川1')
    assert.strictEqual(res.town, '小石川一丁目')
    assert.strictEqual(res.other, '')
  })

  test('丁目の数字だけあるときは正しく「一丁目」まで補充できる（以降も対応）', async () => {
    const res = await normalize('東京都文京区小石川1ビル名')
    assert.strictEqual(res.town, '小石川一丁目')
    assert.strictEqual(res.other, 'ビル名')
  })

  describe('旧漢字対応', () => {
    test('亞 -> 亜', async () => {
      const addresses = ['宮城県大崎市古川大崎東亞', '宮城県大崎市古川大崎東亜']
      for (const address of addresses) {
        const res = await normalize(address)
        assert.strictEqual(res.town, '古川大崎字東亜')
        assert.strictEqual(res.level, 3)
      }
    })

    test('澤 -> 沢', async () => {
      const addresses = [
        '東京都西多摩郡奥多摩町海沢',
        '東京都西多摩郡奥多摩町海澤',
      ]
      for (const address of addresses) {
        const res = await normalize(address)
        assert.strictEqual(res.town, '海澤')
        assert.strictEqual(res.level, 3)
      }
    })

    test('麩 -> 麸', async () => {
      const addresses = ['愛知県津島市池麩町', '愛知県津島市池麸町']
      for (const address of addresses) {
        const res = await normalize(address)
        assert.strictEqual(res.town, '池麸町')
        assert.strictEqual(res.level, 3)
      }
    })

    test('驒 -> 騨', async () => {
      const addresses = ['岐阜県飛驒市', '岐阜県飛騨市']
      for (const address of addresses) {
        const res = await normalize(address)
        assert.strictEqual(res.city, '飛騨市')
        assert.strictEqual(res.level, 2)
      }
    })
  })

  test('柿碕町|柿さき町', async () => {
    const addresses = ['愛知県安城市柿さき町', '愛知県安城市柿碕町']
    for (const address of addresses) {
      const res = await normalize(address)
      assert.strictEqual(res.town, '柿碕町')
      assert.strictEqual(res.level, 3)
    }
  })

  describe('漢数字の小字のケース', () => {
    test('愛知県豊田市西丹波町三五十', async () => {
      const address = '愛知県豊田市西丹波町三五十'
      const res = await normalize(address)
      assertMatchCloseTo(res, {
        town: '西丹波町',
        other: '三五十',
        level: 3,
      })
    })

    test('広島県府中市栗柄町名字八五十2459 小字以降は現在のところ無視される', async () => {
      const address = '広島県府中市栗柄町名字八五十2459'
      const res = await normalize(address)
      assertMatchCloseTo(res, {
        town: '栗柄町',
        other: '名字八五十2459',
        level: 3,
      })
    })
  })
})
