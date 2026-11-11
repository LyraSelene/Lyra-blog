---
title: "CS61A 前五讲笔记：看懂了，但怎么还是写不出来"
date: "2026-11-11 16:38:00"
description: "从漏写 NOISY 后面的数字，到慢慢分清函数和返回值。记一下 CS61A 前五讲里卡过的地方，还有现在的理解。"
cover: "/images/anon-background.webp"
tags: ["CS61A", "Python", "学习笔记"]
---

## 先记一下，真的会卡住

学到前五讲，我问过一个问题：hw 和 lab 很难，做不出来，这正常吗？

因为看例子的时候，感觉也没有多复杂。跟着算几个数，能算对。可是换一道题，让自己写，就不知道从哪一行开始了。尤其是函数里面再套函数，返回的还是函数，看着看着就走神了。

所以想把这些记下来。哪些地方当时没懂，后来是怎么一点点想明白的。以后回来看的时候，至少能想起来自己为什么在这里卡住。这里写清楚了的东西，也不等于我闭上笔记就都会写了。

我看的是 Fall 2026，前五讲分别是：

1. **Welcome**
2. **Functions**
3. **Control**
4. **Higher-Order Functions**
5. **Environments**

顺序对照了 [课程表](https://cs61a.org/fa26/)。这篇也放进了读 [Composing Programs 1.6](https://composingprograms.com/3ed/higher-order-functions/) 时做的笔记。后面的 Newton 方法、Currying 和装饰器是教材里的内容，不全是 Lecture 4 当堂讲的。

## Lecture 1：先知道自己在学什么

Welcome 里提到的“抽象”，先记着这个词。现在用前几讲的例子理解，就是把一件事放进函数里，再用这个函数去做别的事。

比如后面的求和，不用每次都重新写循环。循环写一次，换一个计算每一项的函数就可以了。这样回头看，“抽象”比单独读定义容易懂一点。

## Lecture 2：`f` 和 `f(x)`，差一个括号差很多

### 表达式、运算符与调用

先留一张最基础的表，后面算题还会用到。表达式会算出一个值，比如 `2 + 3 * 4` 是 `14`；赋值、`def` 这些语句则做绑定名字、定义函数之类的事。

| 写法 | 含义 | 例子 |
|---|---|---|
| `/` | 真除法 | `7 / 2` 得到 `3.5` |
| `//` | 向下取整的除法 | `7 // 2` 得到 `3`，`-7 // 2` 得到 `-4` |
| `%` | 余数 | `7 % 2` 得到 `1` |
| `**` | 乘方 | `2 ** 3` 得到 `8` |
| `=` | 绑定名字 | `x = 3` |
| `==` | 比较相等 | `x == 3` |

调用表达式的规则是：先求操作符，再从左到右求实参，最后应用得到的函数。因此 `max(2, 3 + 4)` 中，要先找到 `max`，再得到实参 `2` 和 `7`，最后调用。

### 写了 `def`，还没有开始算

```python
def square(x):
    return x * x
```

这一段先创建函数，让名字 `square` 指向它。还没有算任何一个数的平方。写到调用：

```python
square(3)
```

才会执行函数体并得到 `9`。

所以我需要分开看这两种写法：

```python
square      # 函数对象
square(3)   # 调用结果 9
```

后面学高阶函数，这个区别一直在出现。传进去的是 `square`，还是 `square(3)` 算出来的 `9`，得先看清楚。

### 函数调用的求值顺序

对：

```python
square(3 + 1)
```

可以按以下步骤理解：

1. 找到名字 `square` 对应的函数对象；
2. 求参数表达式 `3 + 1`，得到 `4`；
3. 创建一次 `square` 的调用；
4. 把参数 `x` 绑定到 `4`；
5. 执行 `x * x`；
6. 用 `return` 把 `16` 交给调用者。

### `return` 和 `print` 不同

```python
def triple(x):
    return 3 * x

def show_triple(x):
    print(3 * x)
```

`triple(4)` 的结果是 `12`；`show_triple(4)` 会在屏幕显示 `12`，但函数没有显式 `return`，所以返回 `None`。

```python
result = show_triple(4)
# 屏幕显示 12
# result 的值是 None
```

现在给自己记一句：屏幕上看到了 `12`，还得再看代码里有没有 `return`。不能直接把它当成 `result` 的值。

### 名字绑定与局部参数

```python
x = 10

def add_one(x):
    return x + 1

result = add_one(3)
```

调用时，`add_one` 的参数 `x` 在一次新的局部调用中绑定为 `3`。全局的 `x` 仍然是 `10`，而 `result` 绑定为 `4`。

赋值语句要先求右侧，再绑定左侧：

```python
x = add_one(x)
```

先读取旧的全局 `x`，得到 `10`；调用返回 `11`；最后才把全局 `x` 重新绑定为 `11`。

名字可以指向同一个函数，也可以重新绑定：

```python
def square(x):
    return x * x

saved = square
square = 5
saved(3)  # 9
# square(3) 会报 TypeError，因为名字 square 现在指向整数 5
```

函数对象和指向它的名字要分开看。给名字重新赋值，不会把原来的函数对象变成整数。

### 写之前，先想好要返回什么

做题时准备先试这个办法：别急着写，先说清楚传进来什么，最后要返回什么，要不要打印。一个函数先做好一件事。名字也尽量起明白，不然后面几个 `f`、`g`、`h` 放一起更容易晕。

```python
def square(x):
    """Return x squared.

    >>> square(3)
    9
    """
    return x * x

assert square(0) == 0
assert square(-3) == 9
```

文档字符串中的 `>>>` 是可由 `doctest` 执行的示例；写在文档里不会自动测试。`assert` 的条件为假时抛出 `AssertionError`，为真时继续执行。检查普通输入之外，还要考虑 `0`、负数和边界值。

## Lecture 3：条件和循环，得一轮一轮算

这里把 `if` 和 `while` 的规则也留一下。后面题目套上函数以后，里面还是这些步骤。

### 条件语句

```python
def absolute(x):
    if x < 0:
        return -x
    else:
        return x
```

条件为真时执行 `if` 分支，否则执行 `else` 分支。执行到 `return` 后，当前函数立即结束，后面的代码不会继续运行。

### 布尔表达式与短路

```python
x > 0 and x < 10
```

`and`、`or` 会短路。比如：

```python
False and something()
```

右侧不会调用，因为左侧已经足以决定整个表达式的结果。

`or` 在左侧为真时跳过右侧；`not` 则把真值取反并返回布尔值。数值 `0`、`None` 和空字符串等是假值，其他非零数值是真值。`if/elif/else` 从上到下检查条件，只执行第一个满足条件的分支。

在 Python 中，`and` 和 `or` 返回的可能是操作数本身：

```python
3 and 5    # 5
0 and 5    # 0
```

因此不要机械地把它们理解成只返回 `True` 或 `False`。

### `while` 里那个数到底在表示什么

```python
i = 0
while i < 3:
    print(i)
    i = i + 1
```

每轮开始时，`i` 是当前状态；循环体打印它并把它更新。写循环时要明确三件事：

- 初始状态；
- 每轮更新；
- 什么时候条件会变成假。

Lecture 3 的质因数分解示例可以写成：

```python
def prime_factors(n):
    while n > 1:
        k = smallest_factor(n)
        print(k)
        n = n // k
```

其中的辅助函数也可以只用循环写出，假设输入是大于 `1` 的整数：

```python
def smallest_factor(n):
    k = 2
    while n % k != 0:
        k += 1
    return k
```

`prime_factors(12)` 依次打印 `2`、`2`、`3`。这个例子把“寻找最小因子”和“反复分解”拆开；`prime_factors` 不必重复写寻找因子的细节。

`n` 始终表示还没分解完的部分。对 `12` 来说，它会变成 `12 → 6 → 3 → 1`。这样再看“不变量”就具体一点：数值在变，但“还没分解完的部分”这个含义一直没变。

### 这题我真的漏写了东西

刚做下面这题，我写的是三行 `NOISY`。知道会调用三次，却没把 `print` 的另一个参数 `x` 写出来。

```python
def noisy(x):
    print("NOISY", x)
    return x + 1

noisy(noisy(2) + noisy(3))
```

重新算的时候，不能只数有几个 `noisy`。每调用一次，都要把“打印什么”和“返回什么”分开记：

```
noisy(2) → 打印 NOISY 2，返回 3
noisy(3) → 打印 NOISY 3，返回 4
```

外层调用收到 `3 + 4 = 7`：

```
noisy(7) → 打印 NOISY 7，返回 8
```

所以实际打印的是 `NOISY 2`、`NOISY 3`、`NOISY 7`。外层收到的是 `7`，外层返回的才是 `8`。这个 `8` 没被 `print` 打印出来；在 Python 交互式环境里直接输入整个表达式时，还会显示它的值。

这题改过以后，感觉只记“从里往外算”还不够。打印用的值和返回给外面的值，也得分清楚。

## Lecture 4：函数怎么还能传进去、再传出来

高阶函数这个名字先放一边。它做的事情就是：接收一个函数，或者返回一个函数。定义不长，真正难的是读代码的时候，还记得某个名字现在指向的是函数。

### `summation`：这里传的是 `cube`，不是 `cube(n)`

教材比较自然数求和、立方和与 π 的近似求和。它们都重复“遍历、计算一项、累加”的流程，变化的只是每一项如何计算：

```python
def summation(n, term):
    total, k = 0, 1
    while k <= n:
        total = total + term(k)
        k = k + 1
    return total

def cube(x):
    return x * x * x

summation(3, cube)  # 36
```

这里 `summation` 负责通用流程，`cube` 负责项的计算。执行时：

```
term → cube
term(1) → 1
term(2) → 8
term(3) → 27
总和 → 36
```

这次练习里，我能解释出来为什么这里不能写成 `cube(n)`：看 `summation` 的定义，`term` 后面还要加括号调用，所以它得是函数。`cube` 是函数，`cube(3)` 却已经是整数 `27` 了。

如果把 `27` 传进去，走到 `term(k)` 就相当于想调用一个整数，会报 `TypeError`。能说清楚这一点，比只记住“这里不加括号”好一点。

同一个抽象也可以求自然数和：

```python
def identity(x):
    return x

summation(10, identity)  # 55
```

教材的第三个例子是用级数近似 π：

```python
def pi_term(k):
    return 8 / ((4 * k - 3) * (4 * k - 1))

summation(100, pi_term)  # 约 3.13659
```

前三项是 `8/(1*3)`、`8/(5*7)`、`8/(9*11)`。`pi_term` 表达“第 k 项怎么算”，`summation` 表达“如何累加前 n 项”。同理，奇数平方和只需换成 `lambda k: (2 * k - 1) ** 2`。这种拆分的目的，是在改变问题时复用流程。

### `improve`：只管反复改，不管改什么

```python
def improve(update, close, guess=1):
    while not close(guess):
        guess = update(guess)
    return guess
```

`improve` 不知道自己在求黄金比例、平方根还是别的东西。它只知道一个通用流程：

```
检查 guess
→ 不够好就 update
→ 再检查
→ 直到 close 返回 True
```

`update` 决定下一次猜测，`close` 决定什么时候停止。

例如：

```python
def update(x):
    return x * 2

def close(x):
    return x >= 20

improve(update, close, guess=3)
```

猜测序列是 `3 → 6 → 12 → 24`，当 `close(24)` 为真时返回 `24`。注意 `close` 是判断函数，不是整个 `improve` 或 `find_zero`。

### 黄金比例这个例子也慢慢算

黄金比例 φ 满足 `φ = 1 + 1/φ`，也满足 `φ² = φ + 1`。前者可以提供更新规则，后者可以提供停止条件：

```python
def approx_eq(x, y, tolerance=1e-12):
    return abs(x - y) < tolerance

def golden_update(guess):
    return 1 / guess + 1

def square_close_to_successor(guess):
    return approx_eq(guess * guess, guess + 1)

phi = improve(golden_update, square_close_to_successor)
# phi 约为 1.61803398875
```

从默认 `guess = 1` 开始，猜测依次约为 `1 → 2 → 1.5 → 1.6667 → 1.6 → …`。每轮先判断当前猜测是否合格，不合格才更新。注意 `close` 为真表示“可以停止”，所以循环条件必须是 `not close(guess)`。

浮点运算存在误差，因此用差的绝对值小于容差判断接近。这里沿用教材的绝对误差思路，并把示例容差设为 `1e-12`；真实数值程序还需要结合数据尺度、相对误差和迭代次数限制设计终止条件。

教材还用黄金比例的公式解交叉检查算法：

```python
from math import sqrt as math_sqrt

assert approx_eq(phi, (1 + math_sqrt(5)) / 2)
```

这里没有输出是正常的，断言没有失败。先记住，测试成功不一定会在屏幕上出现一句“成功”。

### 函数写在函数里面，有什么用

嵌套定义解决的不只是“函数写在里面”。假设平方根的单次更新需要两个参数：

```python
def average(x, y):
    return (x + y) / 2

def sqrt_update(x, a):
    return average(x, a / x)
```

`improve` 只会调用 `update(guess)`，不会额外传入 `a`。可以在外层接收 `a`，让内部函数只暴露变化的 `x`：

```python
def sqrt(a):
    def sqrt_update(x):
        return average(x, a / x)
    def sqrt_close(x):
        return approx_eq(x * x, a)
    return improve(sqrt_update, sqrt_close)

sqrt(9)  # 约 3.0
```

对正数 `a`，`sqrt_update` 使用当前猜测与 `a/x` 的平均值来改进猜测。内部函数通过定义环境找到 `a`；它的调用接口仍只有一个参数，正好适配 `improve`。同时，这些辅助名字被放在 `sqrt` 的局部环境中。

从 `sqrt(9)` 的默认猜测 `1` 开始，更新为 `5 → 3.4 → 3.023529… → … → 3`。这里给自己标一下：`a` 是要开方的那个数，这次一直是 `9`；`x` 才是每轮变化的猜测。

```python
def make_adder(n):
    def adder(x):
        return x + n
    return adder
```

调用：

```python
add_three = make_adder(3)
add_three(4)  # 7
```

`make_adder(3)` 返回的是函数 `adder`，不是数字。这个函数还要等到 `add_three(4)` 时才真正计算。

### 词法作用域：往哪里找 `x`

局部函数按**定义位置**查找名字，而不是按调用位置查找。

```python
x = 10

def f():
    return x

def g():
    x = 20
    return f()

g()  # 10
```

`f` 在全局定义，所以它的 parent 是全局环境；调用它的 `g` 的局部 `x = 20` 不会被 `f` 看到。

这两条环境规则最重要：

1. 每个用户定义函数记录它被定义时的 parent 环境；
2. 调用函数时，新 frame 的 parent 是该函数记录的 parent。

### 闭包：外面的函数返回了，里面的怎么还能用

闭包是函数和它定义时可访问环境的组合：

```python
def make_multiplier(n):
    def multiply(x):
        return n * x
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

double(5)  # 10
triple(5)  # 15
```

`double` 和 `triple` 的代码结构相同，但分别保留了 `n = 2` 和 `n = 3`。

更准确地说，函数保留的是对定义环境的访问，并非把所有名字的值冻结成快照。比如全局定义的 `f` 如果读取全局 `x`，在调用 `f` 之前把全局 `x` 重新绑定，它会读到新的值。

### `compose1`：先算里面的 `g`

```python
def compose1(f, g):
    def h(x):
        return f(g(x))
    return h
```

```python
def double(x):
    return 2 * x

def add_one(x):
    return x + 1

h = compose1(add_one, double)
h(4)  # 9
```

先调用 `double(4) → 8`，再调用 `add_one(8) → 9`。返回 `h` 与返回 `h(x)` 完全不同：前者返回函数，后者返回调用结果。

## Newton 方法：这里我又卡住了

读到这个例子，我还问过它怎么体现机器学习的思想。现在先把代码本身弄清楚：它要找一个输入 `x`，让 `f(x)` 接近 `0`。机器学习的联系放在后面记。

### 先拿一个数算一遍

在曲线上取点 `(x, f(x))`，用该点的切线近似曲线。切线斜率是导数 `f'(x)`。令切线与横轴交点的横坐标为 `x_new`，可得：

```
x_new = x - f(x) / f'(x)
```

再把这一步写成代码。这里返回的又是一个函数：

```python
def newton_update(f, df):
    def update(x):
        return x - f(x) / df(x)
    return update
```

`newton_update` 接收函数 `f` 和导数 `df`，返回一个新的 `update` 函数。这个 `update` 是闭包，因为它保留了外层的 `f` 和 `df`。

例如：

```python
def f(x):
    return x * x - 9

def df(x):
    return 2 * x

update = newton_update(f, df)
update(2)  # 3.25
```

计算：

```
f(2) = -5
df(2) = 4
2 - (-5 / 4) = 3.25
```

### 为什么 `close` 传的是 `near_zero`，不是 `find_zero`

```python
def find_zero(f, df):
    def near_zero(x):
        return approx_eq(f(x), 0)
    return improve(newton_update(f, df), near_zero)
```

这个问题我当时专门问了：为什么这里 `close` 不是代的 `find_zero`，而是 `near_zero`？

后来得回到 `improve` 里看它怎么用 `close`。它会执行 `close(guess)`，所以这里需要一个接收当前猜测、判断能不能停止的函数。`near_zero` 正好做这件事：检查 `f(x)` 是否接近 `0`。这几个名字可以先分开：

```
find_zero：组织求零点的过程
improve：反复迭代
update：生成下一次猜测
near_zero：判断是否停止
```

`find_zero(f, df)` 返回最终的数；`near_zero(x)` 返回 `True` 或 `False`。`close` 要问的是“现在够不够好了”，不能把整个求零点的函数放进去。

原来光看名字真的不行，还是要看它被怎么调用、该返回什么。

### 求平方根与任意次方根

平方根可以改写为找：

```
x² - a = 0
```

```python
def square_root_newton(a):
    def f(x):
        return x * x - a
    def df(x):
        return 2 * x
    return find_zero(f, df)
```

更一般地，正数 `a` 的正整数 `n` 次根是满足 `x ** n == a` 的正数 `x`。改写成：

```
xⁿ - a = 0
```

```python
def power(x, n):
    product, k = 1, 0
    while k < n:
        product, k = product * x, k + 1
    return product

def nth_root_of_a(n, a):
    def f(x):
        return power(x, n) - a
    def df(x):
        return n * power(x, n - 1)
    return find_zero(f, df)
```

调用：

```python
nth_root_of_a(2, 64)  # 8.0
nth_root_of_a(3, 64)  # 4.0
nth_root_of_a(6, 64)  # 2.0
```

Newton 方法不保证所有输入都收敛。初始猜测、导数是否为零、函数形状和停止容差都会影响结果。

### 我问的“机器学习思想”在哪里

我现在能理解到的联系是，训练也会反复做这些事：

```
当前参数
→ 计算损失
→ 根据导数得到更新方向
→ 更新参数
→ 检查是否足够好
```

如果损失函数是 `L(w)`，可以把 Newton 方法用于寻找驻点：

```
L'(w) = 0
```

此时：

```
f(w) = L'(w)
df(w) = L''(w)
w_new = w - L'(w) / L''(w)
```

这里也记个提醒：导数为零，不一定就到了最小值，也可能是最大值或其他驻点。不能算出零点就直接说“训练好了”。

至于实际训练，现代神经网络常用梯度下降、SGD 或 Adam；大模型计算 Hessian 的代价很高。Newton 这个例子让我先看到了反复更新参数的结构，还不能据此说我已经懂了机器学习。

## Currying：连续三个括号，先一个一个拆

看到 `curry2` 里套了三层 `def`，我直接问了“这个怎么运作的”。先把它想做的事写下来。原来是：

```python
f(x, y)
```

Currying 变成：

```python
g(x)(y)
```

```python
def curry2(f):
    def g(x):
        def h(y):
            return f(x, y)
        return h
    return g
```

```python
def add(x, y):
    return x + y

curried_add = curry2(add)
curried_add(3)(4)  # 7
```

后来我把三个调用分开，才容易跟上：

```
curry2(add) → g
g(3)        → h，闭包保存 x = 3
h(4)        → add(3, 4) → 7
```

反过来，把两次调用变回一次，就是 `uncurry2`：

```python
def uncurry2(g):
    def f(x, y):
        return g(x)(y)
    return f
```

因此：

```python
uncurry2(curry2(f))(x, y) == f(x, y)
```

这里表达的是：对适用的双参数函数，两种调用方式实现相同的计算；它们不是同一个函数对象。对于会打印或改变状态的函数，不能把这行当成必须执行两次原函数的通用验证方法。

## Lambda：先换回 `def` 也可以

``lambda`` 创建一个没有显式名字的函数，函数体只能是一个表达式：

```python
lambda x: x * 2 + 1
```

等价于：

```python
def transform(x):
    return x * 2 + 1
```

```python
f = lambda x: x + 3
g = lambda x: x * 2
f(g(4))  # 11
```

简单的这个能算，但遇到嵌套的 `lambda`，还是可以先展开成 `def`。不用为了代码短，就逼自己一眼看明白。

## 装饰器：先把 `@` 换成普通赋值

教材说函数是“一等公民”。放回这些例子里看，就是函数可以：

- 绑定到名字；
- 作为参数；
- 作为返回值；
- 放入列表等数据结构。

装饰器这里，我先记这段小代码：

```python
def trace(fn):
    def wrapped(x):
        print("before")
        return fn(x)
    return wrapped

@trace
def double(x):
    return x * 2
```

`@trace` 等价于：

```python
def double(x):
    return x * 2

double = trace(double)
```

调用 `double(5)` 时，实际先调用 `wrapped(5)`，打印 `before`，再调用原来的 `double(5)`，返回 `10`。

之前做这题，我回答的是 `before` 和 `10`。现在写笔记要把它们分开：如果是 `result = double(5)`，屏幕只打印 `before`，`result` 里面存 `10`。再写 `print(result)`，才多打印一行 `10`。

`@trace` 在执行函数定义时就完成包装了，里面的 `wrapped` 则要等调用才执行。这和前面“定义不等于调用”又接上了。

## Lecture 5：把名字放进 frame 里看

前面一直在问的，其实就是“这里的 `x` 到底是哪一个”。frame 图把这些绑定画出来，每层放自己的名字和值，函数再记着自己定义时的 parent。

### 先留住这四条规则

| 操作 | 规则 |
|---|---|
| `x = expression` | 先求右边，再把结果绑定给 `x` |
| `def f(...)` | 创建函数，记录 parent，再绑定 `f` |
| `f(...)` | 创建新的调用 frame，绑定参数并执行函数体 |
| 使用名字 | 从当前 frame 开始，沿 parent 链查找 |

每次调用都会创建新 frame：

```python
def change(x):
    x = x + 2
    return x

a = change(3)
b = change(a)
```

第一次调用返回 `5`，第二次调用从新的 frame、参数 `x = 5` 开始，返回 `7`。两个调用的局部变量互不共享。

### 再看一次，为什么没有用到 20

```python
x = 10

def f():
    return x

def g():
    x = 20
    return f()

g()  # 10
```

`f` 在全局定义，所以它的 parent 是 Global；`g` 的局部 frame 不在 `f` 的查找链上。

嵌套函数则不同：

```python
x = 10

def outer():
    x = 20
    def inner():
        return x
    return inner

h = outer()
x = 100
h()  # 20
```

`inner` 的 parent 是 `outer` 的 frame。即使全局 `x` 后来变成 `100`，`inner` 仍会沿 parent 找到 `20`。

这里的图我留完整一点，回头沿着它找一次 `x`：

```text
Global
  x → 100
  outer → 函数，parent = Global
  h → inner 函数，parent = f1

f1：outer()，parent = Global
  x → 20
  inner → 函数，parent = f1

f2：h()，parent = f1
  查找 x：f2 没有 → f1 找到 20 → 停止
  return 20
```

外层调用返回以后，只要返回的函数仍需要这个环境，就可以继续访问它。画图时也不要把 `return inner` 误画为调用 `inner()`。

### 下次做题，我准备按这个顺序

1. 找到函数定义位置，确定 parent；
2. 每调用一次函数就画一个新 frame；
3. 把实参绑定到参数；
4. 从当前 frame 开始找名字；
5. 找到第一个绑定就停止；
6. 区分返回函数、返回数字和屏幕输出。

## 做过的小题，再留几个在这里

### 最简单的，先确认拿到的是函数还是数

```python
def square(x):
    return x * x

f = square
result = f(3)
```

`f` 是函数，`result` 是 `9`。

### 重复调用：我把次数和输入混了

之前写重复调用的时候，我写过这一段：

```text
i = 1
num = x
while i <= num:
    x = f(x)
    i += 1
return x
```

现在看，`num = x` 就有问题了。我把输入的数当成了重复次数。比如输入 `5`，并不代表要调用五次；调用几次，应该看题目给的 `n`。

里面的 `x = f(x)` 这个更新可以留下，循环条件得改。把它放回完整函数里就是：

```python
def repeated(f, n):
    def repeat(x):
        i = 0
        while i < n:
            x = f(x)
            i += 1
        return x
    return repeat
```

```python
add_three = repeated(lambda x: x + 1, 3)
add_three(5)  # 8
```

这两个名字现在分开记：`n` 是次数，`x` 是正在被改的值。还有 `i = 0` 要放在 `repeat` 里面，每次调用都从零开始数。

### 这道我答了“15 吗？”

```python
def compose1(f, g):
    def h(x):
        return f(g(x))
    return h

def curry2(f):
    def g(x):
        def h(y):
            return f(x, y)
        return h
    return g

def add(x, y):
    return x + y

new_function = compose1(curry2(add), lambda x: x + 1)
result = new_function(4)(10)
```

这次答案是对的，但也把过程留着，免得下次只记得 `15`。先算里面这个：

```
lambda x: x + 1
→ 4 + 1 = 5
```

因此：

```
new_function(4)
→ curry2(add)(5)
→ 返回一个等待第二个参数的函数
```

最后：

```
new_function(4)(10)
→ add(5, 10)
→ 15
```

## 可是，HW 和 Lab 还是难

前面有些题已经能算对了，但这和独立做出作业还是有距离。我确实问过“这正常吗”。

现在先不拿“听懂了”当成“会写了”。接下来做题，准备试着这样拆：

1. 用自己的话复述输入、返回值和限制。
2. 手算一个最小例子，写清每轮状态。
3. 标出每个名字此刻代表数字、布尔值还是函数。
4. 只写出循环不变量或辅助函数接口。
5. 再完成代码，用普通输入、零次操作和边界值检查。
6. 对照解析后，合上答案重新写一遍，再做一个变式。

下面也留几道从简单到综合的练习，不是官方原题。我想慢慢练到能处理 HW / Lab 那种把几个概念放在一起的题，所以没有只留预测输出。答案放在后面，先遮住做。这里有解析，不代表我已经独立做出来了。

### 练习 1：输出和返回值

```python
def show(x):
    print(x + 1)

result = show(4)
```

写出屏幕输出与 `result` 的值，并解释为什么二者不同。

### 练习 2：参数负责什么

补全函数，用已经定义的 `summation` 求前 `n` 个正奇数的平方和：

```python
def sum_odd_squares(n):
    return summation(n, ______)
```

检查 `n = 0`、`1`、`3`。提示：传入的函数应该把项的编号 `k` 变成第 `k` 个正奇数的平方。

### 练习 3：组合与循环

实现 `make_process(f, g, n)`，返回一个函数。这个函数收到 `x` 后，先把 `f` 应用 `n` 次，最后把 `g` 应用一次；假设 `n` 是非负整数。

```python
process = make_process(lambda x: x * 2, lambda x: x + 1, 3)
process(1)  # 9
```

特别检查 `n = 0` 时应直接返回 `g(x)`。提示：重复次数使用单独的计数器，不能把不断变化的 `x` 当成循环上限。

### 练习 4：返回函数的构造

实现 `cycle(f1, f2, f3)`：它返回 `make_cycle`；`make_cycle(n)` 再返回 `apply(x)`。`apply` 按 `f1 → f2 → f3 → f1 → …` 的顺序，总共应用 `n` 次函数。只使用函数定义、条件和 `while`，假设 `n` 是非负整数。

```python
my_cycle = cycle(lambda x: x + 1, lambda x: x * 2, lambda x: x - 3)
my_cycle(0)(5)  # 5
my_cycle(2)(5)  # 12
my_cycle(4)(5)  # 10
```

提示：外层保存三个函数，中层保存次数，内层保存这次输入与计数器；用 `i % 3` 判断当前该调用哪个函数。这里的难点是明确三次调用分别创建了什么环境。

### 练习解析：完成后再核对

练习 1 打印 `5`，但 `result` 是 `None`。`show` 没有显式返回值。

练习 2：

```python
def sum_odd_squares(n):
    return summation(n, lambda k: (2 * k - 1) ** 2)

assert sum_odd_squares(0) == 0
assert sum_odd_squares(1) == 1
assert sum_odd_squares(3) == 35
```

练习 3：

```python
def make_process(f, g, n):
    def process(x):
        i = 0
        while i < n:
            x = f(x)
            i += 1
        return g(x)
    return process
```

练习 4：

```python
def cycle(f1, f2, f3):
    def make_cycle(n):
        def apply(x):
            i = 0
            while i < n:
                if i % 3 == 0:
                    x = f1(x)
                elif i % 3 == 1:
                    x = f2(x)
                else:
                    x = f3(x)
                i += 1
            return x
        return apply
    return make_cycle
```

`my_cycle(4)(5)` 的数据过程是 `5 → 6 → 12 → 9 → 10`。`apply` 的环境链为“本次 apply 调用 → 本次 make_cycle 调用 → 本次 cycle 调用 → Global”。每次调用 `apply` 都重新绑定参数 `x` 并初始化 `i = 0`，所以同一个返回函数再次接收 `5` 时，还会得到同样的计算结果。

## 写到这里，接下来还得练

### 先记住这些区别

- `f` 是函数，`f(x)` 是调用结果；
- `return` 返回值，内置 `print` 显示内容并返回 `None`；
- `def` 创建函数，调用才执行函数体；
- 每次调用创建新 frame；
- 名字按当前 frame 到 parent 链查找；
- 闭包保留定义环境；
- `f(g(x))` 先调用 `g`；
- `curry2(f)(x)(y) == f(x, y)`；
- `@decorator` 大致等价于 `name = decorator(name)`。

### 下次合上笔记，再试着解释

- 为什么 `summation` 可以复用不同的 `term`；
- 为什么 `near_zero` 是 `improve` 的 `close`；
- Newton 方法如何把求根转成找零点；
- 为什么 `f` 看不到调用者的局部变量；
- 为什么返回的内部函数仍能访问外层参数。

### 留给之后的自己

- **当天：**闭卷重写 `summation`、`compose1`、`curry2`、`repeated`。
- **1 天后：**画 `make_adder`、`newton_update`、`outer/inner` 的 parent 链。
- **3 天后：**完成一题包含 `lambda`、闭包和循环的综合题。
- **7 天后：**独立解释 `find_zero(f, df)` 为什么传入 `near_zero`，再尝试阅读 HW/Lab 的环境图题。

- **14 天后：**不看答案重新完成 `cycle`，并解释每层函数返回什么。
- **30 天后：**挑一道曾经卡住的题，记录错误发生在哪一步，以及现在如何检查。

从实际做完这一轮开始算就行。尤其是 `curry2`、`repeated` 和 `near_zero`，之后还得不看解释再写一次。

先记到这里。有些地方能跟着算了，作业还需要慢慢做。

### 不看上面，问自己几句

| 回忆问题 | 核心答案 |
|---|---|
| 执行 `def` 会运行函数体吗？ | 不会；它创建函数并绑定名字，调用时才执行函数体。 |
| `f` 与 `f(x)` 有什么不同？ | 前者取到函数，后者执行调用并得到返回值；返回值本身也可能是函数。 |
| 循环题先检查什么？ | 初始状态、每轮更新、停止条件与不变量。 |
| 高阶函数为什么有用？ | 把通用流程与可变化的行为分开，复用计算模式。 |
| 闭包从哪里查找外层名字？ | 沿函数定义时记录的环境链，而非调用者的局部环境。 |
| `find_zero` 为什么传 `near_zero`？ | `close` 需要接收猜测、返回是否合格的判断函数。 |
| `return h` 和 `return h(x)` 区别是什么？ | 一个返回函数对象，另一个先调用再返回结果。 |

## 资料

- [CS61A Fall 2026 课程主页与课程表](https://cs61a.org/fa26/)
- [Lecture 1：Welcome](https://cs61a.org/fa26/lectures/01-welcome/)
- [Lecture 2：Functions](https://cs61a.org/fa26/lectures/02-functions/)
- [Lecture 3：Control](https://cs61a.org/fa26/lectures/03-control/)
- [Lecture 4：Higher-Order Functions](https://cs61a.org/fa26/lectures/04-higher-order-functions/)
- [Lecture 5：Environments](https://cs61a.org/fa26/lectures/05-environments/)
- [Composing Programs 第三版，Chapter 1](https://composingprograms.com/3ed/)，尤其是 [1.6 Higher-Order Functions](https://composingprograms.com/3ed/higher-order-functions/)。

本文为中文学习整理，不是官方讲义或逐字译文。`summation`、`improve`、黄金比例、嵌套平方根、函数组合、Newton 方法、Currying 与装饰器等例子依据 John DeNero 的 Composing Programs 改写或讲解；教材内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可，本篇文字与示例的整理改编亦按相同许可分享。站点主题、图片等其他资源不包含在本篇许可说明中。
