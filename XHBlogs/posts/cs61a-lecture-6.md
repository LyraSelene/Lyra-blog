---
title: "CS61A Lecture 6：说了懂了，换一道题还是会卡"
date: "2026-11-12 19:20:00"
description: "继续学抽象和高阶函数。从 summation 到 make_adder，记一下函数和数又混起来的地方。最后的 repeat 还没写出来，先停在这里。"
cover: "/images/anon-background.webp"
tags: ["CS61A", "Python", "学习笔记"]
---

## 今天先学到这里

接着[前五讲的笔记](/Lyra-blog/posts/cs61a-lectures-1-5/)，开始学 Lecture 6，主题是 Abstraction。

前面已经见过高阶函数，也做过一些题，但这次换个写法，还是会卡。尤其是 `make_adder`，知道它返回函数，可是一和别的函数放在一起，就又不知道该把什么传进去了。

所以这篇单独记。主要是今天围绕 Lecture 6 做的练习和补充解释，不是整节课的完整讲义。下面有些代码是为了复习重新写的小例子，也不是官方原题。

## summation：循环先留下，每一项换着算

先从自己写过的立方和开始：

```python
def cube(k):
    return k ** 3

def sum_cubes(n):
    total, k = 0, 1
    while k <= n:
        total = total + cube(k)
        k = k + 1
    return total
```

这里 `total` 是目前加出来的总和，`k` 是这一轮的项编号。算完这一项，再让 `k` 加一。

如果换成平方和，循环其实没有怎么变，只是把 `cube(k)` 换成 `square(k)`。于是可以把“每一项怎么算”交给一个参数：

```python
def summation(n, term):
    total, k = 0, 1
    while k <= n:
        total = total + term(k)
        k = k + 1
    return total
```

这样求立方和就能写成：

```python
summation(3, cube)  # 36
```

`summation` 负责从 `1` 加到 `n`，`cube` 负责算其中一项。之后想换一种求和，不用把整个循环重写。

这里我能解释为什么传 `cube`：`term` 后面要被调用，它得是函数。如果写 `cube(3)`，传进去的已经是 `27`，走到 `term(k)` 就不能调用了。

不过做题时还是得看一眼，不能光凭“这里好像不加括号”的印象写。

### 再换成任意次幂

```python
def sum_powers(n, p):
    return summation(n, lambda k: k ** p)

sum_powers(3, 2)  # 1 + 4 + 9 = 14
```

`lambda k: k ** p` 就是交给 `summation` 的那个函数。它收到项编号 `k`，返回 `k` 的 `p` 次方。

这行里面，`k` 是每次调用时传进来的参数，`p` 从外面的 `sum_powers` 环境里找。两个名字虽然都出现在表达式里，来源却不一样。

## 同一个名字，不一定是同一个变量

函数多起来以后，好几个地方都叫 `k` 或 `x`，我就容易把它们放到一起算。

比如下面这个复习例子，故意让内外都用 `k`：

```python
def square(k):
    k = k + 1
    return k * k

summation(3, square)  # 4 + 9 + 16 = 29
```

这个 `square` 比普通平方函数多了 `k = k + 1`。每次调用时，它有自己的局部参数：

| summation 里的 k | square 收到的 k | square 更新后的 k | 返回值 |
|---|---|---|---|
| 1 | 1 | 2 | 4 |
| 2 | 2 | 3 | 9 |
| 3 | 3 | 4 | 16 |

`square` 里面把自己的 `k` 改成 `2`，不会顺带把 `summation` 的 `k` 也改掉。外面那个循环还是按自己的 `k = k + 1` 往下走。

这题我最后算到了 `29`。回来看，还是要分清“现在进入了哪一次函数调用”，不能看到同名就当作共用一个数。

## 返回的函数，到哪里找外面的名字

前面学过环境图，这里又用上了。先用一个小例子把规则留下：

```python
def make_power(p):
    def power(x):
        return x ** p
    return power

square = make_power(2)

def run():
    p = 3
    return square(4)

run()  # 16
```

`run` 里面虽然有 `p = 3`，但 `power` 不是在 `run` 里定义的。它是在那次 `make_power(2)` 的环境里定义的，所以往外找到的是 `p = 2`。

可以简单画成：

```text
square(4) 的调用：x = 4
        ↓ parent
make_power(2) 的环境：p = 2
        ↓ parent
Global
```

`run` 的局部环境不在这条查找链上。

我需要记的是：找外层名字时，看函数在哪里定义。不能因为现在是谁调用它，就跑到谁那里找。

外层调用已经返回，里面的函数仍然可以访问那个环境。这就是这些闭包例子能继续工作的原因。

## 我问过：这里为什么不把 p 当作 2

这个地方又比刚才多了一步：函数能访问定义环境，但不代表所有值都在创建函数时固定了。

用下面这个小例子复习：

```python
def make_term():
    p = 2
    term = lambda k: k ** p
    p = 4
    return term

term = make_term()
term(2)  # 16
```

刚写到 `lambda k: k ** p` 时，只是创建函数，还没有开始算 `k ** p`。等到最后调用 `term(2)`，才执行这个表达式。这时候那个外层环境里的 `p` 已经重新绑定成 `4` 了。

所以算的是 `2 ** 4`。这里我还把乘方算岔过：`2 ** 4` 是四个 `2` 相乘，得到 `16`，不是把数字加起来。

这次先把两个问题分开：一是 `p` 从哪个环境找，二是执行函数体时，那个环境里的 `p` 现在是多少。

### 如果想留下创建时的值

今天还补充看了默认参数这种写法：

```python
def make_term():
    p = 2
    term = lambda k, p=p: k ** p
    p = 4
    return term

term = make_term()
term(2)  # 4
```

`p=p` 右边的 `p` 在创建函数时求值，把当时的 `2` 作为默认参数。调用时没有另外传第二个参数，就用这个默认值。

左边的 `p` 是新函数自己的形参。这里刚好同名，看着绕，但可以先把它理解成“默认用当时算出来的 2”。这个写法还需要再练，先不当成自己已经熟了。

## apply_twice：把上一次的结果继续传进去

```python
def apply_twice(f, x):
    return f(f(x))

def add_one(x):
    return x + 1

result = apply_twice(add_one, 3)  # 5
```

先算里面的 `add_one(3)`，得到 `4`，再把 `4` 交给外面的 `add_one`，得到 `5`。

它不是拿原来的 `3` 分别算两次，再把结果加起来。第二次收到的输入，已经是第一次的返回值。

换成三次，就是：

```python
def apply_thrice(f, x):
    return f(f(f(x)))
```

这次我能写出里面的 `f(f(f(x)))`。但一旦让函数返回函数，又容易把调用补少了。

### make_twice 返回的是什么

```python
def make_twice(f):
    def twice(x):
        return apply_twice(f, x)
    return twice
```

外层先收到 `f`，返回一个等待 `x` 的函数。等调用这个返回函数，才真正对 `x` 做两次处理：

```python
add_two = make_twice(add_one)
add_two(3)  # 5
```

做这类填空时，我写过 `apply_twice(x)`。回去看定义，`apply_twice` 需要两个参数：做什么操作的函数 `f`，以及当前输入 `x`。

所以不能看到 `x` 就直接往括号里放，还得看被调用的函数需要什么。

## make_adder 又把我绕住了

```python
def make_adder(n):
    def adder(x):
        return x + n
    return adder
```

单独看：

```python
make_adder(3)(4)  # 7
```

可以拆成两次调用：

```python
add_three = make_adder(3)  # 得到一个函数
add_three(4)              # 得到数字 7
```

第一对括号确定“以后加几”，第二对括号才传进“这次要处理的数”。

### 想加两次 n，该把哪个函数交进去

目标是写 `make_add_twice(n)`：返回一个函数，收到 `x` 后，加两次 `n`。

我尝试过：

```python
apply_twice(make_adder, x)
```

但这里的 `make_adder` 是制造加法函数的函数。直接调用 `make_adder(x)`，得到的还是函数，并没有完成“把当前数字加上 n”。

要先准备好那个真正做加法的函数：

```python
def make_add_twice(n):
    def add_twice(x):
        return apply_twice(make_adder(n), x)
    return add_twice

make_add_twice(3)(2)  # 2 → 5 → 8
```

这里 `make_adder(n)` 的返回值正好是 `apply_twice` 需要的函数。

这样又和 `summation` 那里接上了：不是所有地方都“不加括号”。要看调用后拿到的是什么。`cube(3)` 得到数字，但 `make_adder(3)` 得到函数。

| 写法 | 这一步拿到什么 |
|---|---|
| `make_adder` | 一个接收 n、返回加法函数的函数 |
| `make_adder(3)` | 一个接收 x、返回 x + 3 的函数 |
| `make_adder(3)(4)` | 数字 7 |

### 再把 make_twice 套一次

```python
add_one = make_adder(1)
add_two = make_twice(add_one)
add_four = make_twice(add_two)

result = add_four(3)  # 7
```

这题我答了 `7`。

`add_two` 做两次加一；`add_four` 做两次 `add_two`。展开后就是总共四次加一：`3 → 4 → 5 → 6 → 7`。

外层的“两次”，是对传进来的整个函数做两次。传进来那个函数里面可能已经做了好几步，不能只数外面有几层括号。

## 最后停在 repeat，这题还没写出来

最后做到的是这道填空，假设 `n` 是非负整数：

```python
def repeat(f, n):
    def g(x):
        i = 0
        while i < n:
            ______
            i += 1
        return x
    return g
```

要让它做到：

```python
repeat(make_adder(2), 3)(1)
# 目标过程：1 → 3 → 5 → 7
```

我写的是：

```python
x = x + f(i)
```

整理时再看这行，问题出在又用了 `summation` 的累加思路：看到循环，就想往 `x` 上加一点东西。

按我这行代码实际算，第一轮 `i = 0`，`f(0)` 是 `2`，所以 `x` 从 `1` 变成 `3`，碰巧对上了。但第二轮 `i = 1`，`f(1)` 是 `3`，于是 `x` 变成 `3 + 3 = 6`。目标里的第二步应该是 `5`，这里就已经不对了。

目前得到的提示是：`i` 用来数执行了几次，`x` 才是每轮正在被处理的值。下一次处理，要接着上一次的结果。

今天先停在这里，空格先留着。下次回来，先不要往下翻答案，就从“当前 x 是 3，要让 f 把它变成 5”开始想，再补这一行。

前面的文章其实已经记录过类似的重复调用写法。现在隔了一次，再让我自己填，还是混进了累加。这也说明看过解析和能独立写出来，确实还有距离。

## 下次从哪里接着学

今天的预测结果题，有几道能跟着算了；`make_adder(n)` 为什么能传给 `apply_twice`，也比一开始清楚一些。需要继续练的还是自己写代码，以及每一层调用后拿到的到底是函数还是数字。

下次先做这几件事，不急着继续加新概念：

1. 合上笔记补出 `repeat`，手算三轮，确认每次用的是当前值。
2. 检查重复零次时会怎样，再用同一个返回函数调用两次，看看计数器有没有重新开始。
3. 不看上面，解释 `make_adder`、`make_adder(3)`、`make_adder(3)(4)` 的区别。
4. 再画一次返回函数的 parent 链，把“从哪里找名字”和“什么时候读取值”分开。

复习先按下次、三天后、一周后各看一次来安排。重点不是重读整篇，而是遮住代码，试着写出那几行。

今天先记到这。说过几次“懂了”，但最后这个空格还没补出来，也留在这里。

## 资料

- [CS61A Fall 2026 课程表](https://cs61a.org/fa26/)
- [Composing Programs：Higher-Order Functions](https://composingprograms.com/3ed/higher-order-functions/)
- [上一篇：CS61A 前五讲笔记](/Lyra-blog/posts/cs61a-lectures-1-5/)

本文是个人学习过程的整理，不是官方讲义。`summation`、闭包、返回函数等示例参考 John DeNero 的 Composing Programs，并结合练习改写。教材采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可，本篇文字与示例的整理改编亦按相同许可分享；站点主题、图片等其他资源不包含在本篇许可说明中。
