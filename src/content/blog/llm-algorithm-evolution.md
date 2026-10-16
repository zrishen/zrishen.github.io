---
title: LLM底层算法的演变
date: 2026-10-14
description: 从 n-gram 到 Decoder-Only，我把语言模型七十多年的路串了一遍——每一个新算法，都是被上一个算法的瓶颈逼出来的。
---

每天都在用 LLM，却很少回头想它是怎么一步步走到今天的。往前捋，我发现这条路出奇地干净，六代算法串成一条主线：

<p class="roadmap">n-gram → FNN → RNN → LSTM → Transformer → Decoder-Only</p>

而且每一步都不是凭空冒出来的新发明，而是被上一步的瓶颈逼出来的。<span class="highlight">它们从头到尾都在回答同一个问题——给定上文，下一个词是什么。</span>变的只是上下文怎么被记住、被压缩、被取用。

## n-gram

“预测下一个词”，本质上是在**给一句话算概率**。一个句子 S 由 m 个词组成，它出现的概率按链式法则，可以拆成一串条件概率的连乘：

<p class="formula">P(S) = P(w<sub>1</sub>, w<sub>2</sub>, …, w<sub>m</sub>) = P(w<sub>1</sub>) · P(w<sub>2</sub>|w<sub>1</sub>) · P(w<sub>3</sub>|w<sub>1</sub>,w<sub>2</sub>) · … · P(w<sub>m</sub>|w<sub>1</sub>,…,w<sub>m-1</sub>)</p>

式子很精确，但越往后的条件越长，最后一个词的概率得背上前面全部的词，这在真实语料里根本估不出来。最早的做法非常朴素，把概率数出来。统计语料里“词 A 后面跟词 B”出现过多少次，挑概率最大的，这就是 n-gram 语言模型。为了不让条件无限增长，它做了马尔可夫假设，把每一项截断成只看最近 n-1 个词：

<p class="formula">P(w<sub>i</sub>|w<sub>1</sub>,…,w<sub>i-1</sub>) ≈ P(w<sub>i</sub>|w<sub>i-n+1</sub>,…,w<sub>i-1</sub>)</p>

常见的 bigram、trigram，就是把 n 取成 2 和 3。

<img src="/images/ngram-vs-markov.png" style="width: 70%" alt="完整上下文（左）与二元模型近似（右）的对比：预测第四个词时，前者利用前三个词，后者只看第三个词">

<p class="caption">完整上下文与马尔可夫近似的对比，以只看前一个词的二元模型（n = 2）为例</p>

这套数出来的办法统治了语言建模几十年，但有两个天生的毛病。

- 数据稀疏：词的组合无穷，语料有限，“吃了个三明治”这种搭配就可能没出现过、概率为零，那整句话概率也是零。
- 泛化不足：它不认识“语义相似”，“猫”和“猫咪”毫不相干，“猫咪在睡觉”数得再多，“猫在睡觉”也还是没出现过，概率照样是零。

它记住了字面，却不知道意思。

## FNN

2003 年，Bengio 第一次让神经网络来做预测：**不数了，学。**

那篇[《A Neural Probabilistic Language Model》](https://www.jmlr.org/papers/v3/bengio03a.html)做了两件事，都成了后面的地基。

- 词向量：把每个词映射成一个低维稠密向量，“猫”和“猫咪”的向量会靠得很近，见过的组合会带出没见过的组合，稀疏和泛化的问题一下子松开了。
- 前馈神经网络（Feedforward Neural Network，FNN）：把固定窗口内几个词的向量拼起来喂给它，输出下一个词的概率分布。

<img src="/images/fnn-architecture.png" style="width: 80%" alt="FNN 语言模型：固定窗口内的三个词映射为词向量，拼接后经隐藏层与 Softmax，输出下一个词的概率分布">

<p class="caption">FNN 语言模型示意：固定窗口 → 词向量 → 拼接 → 隐藏层 → Softmax → 下一词概率分布</p>

这是语言模型第一次有了“相似”的概念，词向量从此成了 NLP 的通用零件（后来的 [word2vec](https://arxiv.org/abs/1301.3781) 只是把它带火了）。

但它的局限也在这里：窗口是固定的。想看前 5 个词就设成 5，想看更远就得开更大的窗口，参数跟着涨。上下文长度被写死在了结构里，而语言里的依赖，远和近从来是说不准的。

## RNN

于是有了一个很自然的想法。能不能别让模型只看固定几个词，而是让它一边读、一边记？循环神经网络（Recurrent Neural Network，RNN）的答案是：**把读过的词，都记进一个状态里。**

每读一个词，就更新一次这个隐状态，h<sub>t</sub> = f(h<sub>t-1</sub>, x<sub>t</sub>)。这个向量承载“到目前为止读到的全部历史”，同一个网络、同一套参数，一步一步循环下去，所以理论上它能记住无限长的上文，参数量还不随上下文增长。

<img src="/images/rnn-unrolled.png" style="width: 80%" alt="RNN 按时间展开：隐状态沿时间步链式传递">

<p class="caption">RNN 按时间展开：同一个隐状态沿时间步往下传</p>

RNN 这个结构 1990 年前后就有了。2010 年 [RNNLM](https://doi.org/10.21437/Interspeech.2010-343) 把它用作语言模型，2014 年 [seq2seq](https://arxiv.org/abs/1409.3215) 用它做翻译，做法就是一读一写，编码器先把整句话读完，压成一个向量，解码器再从这个向量里吐出译文。

但 RNN 很快撞上了两堵墙。

- 记忆衰减：理论上无限长，实践里缩水得厉害。反向传播一路穿过时间步，梯度指数级衰减，开头的信息传不到结尾，像一场传话游戏。seq2seq 把整句压成一个向量，句子一长，译文后半段就开始不对劲。
- 并行受限：第 t 步必须等第 t-1 步算完，天然串行，GPU 再多也只能排队干等。

## LSTM

RNN 的第一堵墙（记忆衰减）早在 1997 年就被解决了，比上面那些应用还早。

那年 [LSTM](https://doi.org/10.1162/neco.1997.9.8.1735)（Long Short-Term Memory）**给记忆装上了门**：一条“记忆传送带”（cell state），再配三个门。遗忘门决定丢掉什么，输入门决定写入什么，输出门决定这一步吐出什么。信息在传送带上流动时，梯度可以几乎无损地回流，长距离依赖终于学得动了。

<img src="/images/lstm-cell.png" style="width: 80%" alt="LSTM 内部结构：一条记忆传送带（cell state）加上遗忘、输入、输出三个门">

<p class="caption">LSTM 单元内部：记忆传送带与三个门</p>

2014 到 2017 年，LSTM 是当之无愧的主角，机器翻译、语音识别、文本生成全面开花，深度学习第一次在 NLP 上压过了统计方法。

但第二堵墙（串行）谁也绕不过去。而且隐状态这个瓶颈依然存在，无论前面读过多少内容，都只能挤进一个固定大小的向量，再传给下一步。

翻译领域先想出了一个聪明的补丁，让解码器不再只盯着那个句向量，而是回头去看编码器的所有位置，动态决定“现在该看哪些词”，这就是 2014 年提出的 [attention](https://arxiv.org/abs/1409.0473)，它其实已经撬开了瓶颈。

顺着这个思路再往下想一步，既然 attention 这么好用，还需要 RNN 吗？


## Transformer

2017 年，[《Attention Is All You Need》](https://arxiv.org/abs/1706.03762)给出的答案是：**不要了，用注意力取代循环。**

我们平时用 AI，给它一句话，它回一句话。输入「小猫饿了，它在叫」，它回「喂点东西吧」。回话不是凭空来的，它得先把输入读一遍，读的过程就是自注意力。

进来的是切开的词，这里取其中五个，小猫、饿、它、在、叫，每个词一个向量，各自独立，谁也看不见谁，“它”就只是一个代词。

自注意力要做的，是让每个词都和其他所有词算一遍关系，决定该从谁那里取多少信息。五个词各算一条，每条都是它分给全句的注意力：

<p class="formula">它 → 小猫 0.62，叫 0.13，饿 0.12，在 0.09，它 0.04<br>叫 → 它 0.44，小猫 0.31，在 0.13，饿 0.08，叫 0.04<br>小猫 → 饿 0.48，叫 0.27，在 0.12，它 0.09，小猫 0.04<br>饿 → 小猫 0.51，叫 0.21，它 0.17，在 0.07，饿 0.04<br>在 → 叫 0.46，它 0.24，小猫 0.18，饿 0.08，在 0.04</p>

按各自的配比，把全句的向量各取一份加起来，每个词就换来一个新向量，里面装着它从全句取到的信息。“它”那一行里“小猫”占了大头，装进去的主要就是小猫。“叫”那一行取到了“它”和“小猫”，也就大致知道是谁在叫。

读完这一遍，“它”不再指代不明，模型凭着读懂的信息往下写，就写出了「喂点东西吧」。

这一层会叠很多遍，每叠一遍，每个词就被全句重新理解一次。

写成公式是这样：

<p class="formula"><math display="block"><mi>Attention</mi><mo stretchy="false">(</mo><mi>Q</mi><mo>,</mo><mi>K</mi><mo>,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mi>softmax</mi><mo>(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><mi>d</mi></msqrt></mfrac><mo>)</mo><mo>·</mo><mi>V</mi></math></p>

Q、K、V 是每个词的向量乘三个不同权重矩阵得到的三个角色。Q 负责发问，K 负责被问，两者一算就是前面那套配比；V 是被取走的内容，按配比混合的就是它。再配上多头（同时从多个角度关注）、前馈网络、残差连接和 LayerNorm，加上最前面补顺序的位置编码（注意力本身无序），就是一层 Transformer。

<img src="/images/transformer-architecture.png" style="width: 50%" alt="Transformer 原版架构：编码器-解码器结构，多头注意力、前馈网络、残差与归一化">

<p class="caption">Transformer 的编码器-解码器结构</p>

每个词都能直接看到全句，计算互不依赖，整句话可以并行展开。训练就能吃满 GPU，把模型做得更大。这是通往大模型时代的门票。代价是注意力对序列长度是平方复杂度，长序列很贵，后来关于长上下文、[FlashAttention](https://arxiv.org/abs/2205.14135) 的工作，都是在还这笔账。

原版 Transformer 是 encoder-decoder，编码器负责理解，解码器负责生成，但也留下了三条能各砍一刀的路。

## Decoder-Only

2018 年，三条路几乎同时起步。

- [BERT](https://arxiv.org/abs/1810.04805)：只留编码器，用“完形填空”的方式学习，在各种理解任务上屠榜。
- [T5](https://arxiv.org/abs/1910.10683) 等：保留完整的 encoder-decoder。
- [GPT](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)：只留解码器，老老实实做一件事，自回归地预测下一个词。

当时没人敢说哪条路是终点。后来的结果证明，**砍掉一半的 decoder-only，反而赢了**，赢在简单。

它只剩一个目标，给定上文，预测下一个词。你用的时候也是一样，一个词一个词往下接，训练和推理做的是同一件事，不用额外加什么结构。BERT 学得再好，想让它生成也得再想办法；encoder-decoder 多一半结构，就多一半的复杂。

更重要的是，简单让它特别适合放大。同一个目标函数、同一套结构，参数从 1.17 亿（GPT-1）、15 亿（GPT-2，2019）一路加到 1750 亿（[GPT-3](https://arxiv.org/abs/2005.14165)，2020），模型没崩，还长出了没人设计过的能力，不用微调，给几个例子就能照做，这就是 [in-context learning](https://arxiv.org/abs/2301.00234)。从这以后，“预训练一个大模型”成了主路线。

2020 年之后，底层架构没再大变过，热闹都在别处，规模怎么加更划算（[scaling law](https://arxiv.org/abs/2001.08361) 与 [Chinchilla](https://arxiv.org/abs/2203.15556)）、输出怎么和人类偏好对齐（[RLHF](https://arxiv.org/abs/2203.02155)，Reinforcement Learning from Human Feedback）、把算力花在推理时（[o1](https://openai.com/index/introducing-openai-o1-preview/)、[R1](https://arxiv.org/abs/2501.12948) 这类推理模型），还有 [MoE](https://arxiv.org/abs/1701.06538)（Mixture of Experts）、长上下文这些工程上的打磨。

## 总结

把这条线连着看下来，每一步的因果都特别清楚。

n-gram 的数据稀疏和泛化不足，逼出了神经网络和词向量；FNN 的固定窗口，逼出了 RNN 的隐状态；RNN 的梯度消失，逼出了 LSTM 的门；LSTM 的串行与瓶颈，逼出了 Transformer 的注意力；Transformer 三足鼎立，最后收敛到 decoder-only。

这些算法，无论哪一代，都在回答同一个问题，给定上文，下一个词是什么。变的只是**上下文如何被记住、被压缩、被取用**。n-gram 靠计数窗口，FNN 靠固定窗口里拼起来的向量，RNN 和 LSTM 靠一个递归的隐状态，Transformer 靠注意力直接取用。

所以这些老算法不只是考古。位置编码为什么存在？因为注意力天生无序，这在 RNN 时代不用操心；注意力为什么是平方复杂度？因为它用“一眼看全”换掉了“一步步传话”。看懂这些旧痛点，也就看懂了现在模型里的每处设计。
