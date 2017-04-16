var world = [
    -3.0, 0.0, -3.0, 0.0, 6.0,
    -3.0, 0.0, 3.0, 0.0, 0.0,
    3.0, 0.0, 3.0, 6.0, 0.0,
    -3.0, 0.0, -3.0, 0.0, 6.0,
    3.0, 0.0, -3.0, 6.0, 6.0,
    3.0, 0.0, 3.0, 6.0, 0.0,


    -3.0, 1.0, -3.0, 0.0, 6.0,
    -3.0, 1.0, 3.0, 0.0, 0.0,
    3.0, 1.0, 3.0, 6.0, 0.0,
    -3.0, 1.0, -3.0, 0.0, 6.0,
    3.0, 1.0, -3.0, 6.0, 6.0,
    3.0, 1.0, 3.0, 6.0, 0.0,

    -2.0, 1.0, -2.0, 0.0, 1.0,
    -2.0, 0.0, -2.0, 0.0, 0.0,
    -0.5, 0.0, -2.0, 1.5, 0.0,
    -2.0, 1.0, -2.0, 0.0, 1.0,
    -0.5, 1.0, -2.0, 1.5, 1.0,
    -0.5, 0.0, -2.0, 1.5, 0.0,

    2.0, 1.0, -2.0, 2.0, 1.0,
    2.0, 0.0, -2.0, 2.0, 0.0,
    0.5, 0.0, -2.0, 0.5, 0.0,
    2.0, 1.0, -2.0, 2.0, 1.0,
    0.5, 1.0, -2.0, 0.5, 1.0,
    0.5, 0.0, -2.0, 0.5, 0.0,

    -2.0, 1.0, 2.0, 2.0, 1.0,
    -2.0, 0.0, 2.0, 2.0, 0.0,
    -0.5, 0.0, 2.0, 0.5, 0.0,
    -2.0, 1.0, 2.0, 2.0, 1.0,
    -0.5, 1.0, 2.0, 0.5, 1.0,
    -0.5, 0.0, 2.0, 0.5, 0.0,

    2.0, 1.0, 2.0, 2.0, 1.0,
    2.0, 0.0, 2.0, 2.0, 0.0,
    0.5, 0.0, 2.0, 0.5, 0.0,
    2.0, 1.0, 2.0, 2.0, 1.0,
    0.5, 1.0, 2.0, 0.5, 1.0,
    0.5, 0.0, 2.0, 0.5, 0.0,

    -2.0, 1.0, -2.0, 0.0, 1.0,
    -2.0, 0.0, -2.0, 0.0, 0.0,
    -2.0, 0.0, -0.5, 1.5, 0.0,

    -2.0, 1.0, -2.0, 0.0, 1.0,
    -2.0, 1.0, -0.5, 1.5, 1.0,
    -2.0, 0.0, -0.5, 1.5, 0.0,

    -2.0, 1.0, 2.0, 2.0, 1.0,
    -2.0, 0.0, 2.0, 2.0, 0.0,
    -2.0, 0.0, 0.5, 0.5, 0.0,
    -2.0, 1.0, 2.0, 2.0, 1.0,
    -2.0, 1.0, 0.5, 0.5, 1.0,
    -2.0, 0.0, 0.5, 0.5, 0.0,

    2.0, 1.0, -2.0, 0.0, 1.0,
    2.0, 0.0, -2.0, 0.0, 0.0,
    2.0, 0.0, -0.5, 1.5, 0.0,
    2.0, 1.0, -2.0, 0.0, 1.0,
    2.0, 1.0, -0.5, 1.5, 1.0,
    2.0, 0.0, -0.5, 1.5, 0.0,

    2.0, 1.0, 2.0, 2.0, 1.0,
    2.0, 0.0, 2.0, 2.0, 0.0,
    2.0, 0.0, 0.5, 0.5, 0.0,
    2.0, 1.0, 2.0, 2.0, 1.0,
    2.0, 1.0, 0.5, 0.5, 1.0,
    2.0, 0.0, 0.5, 0.5, 0.0,

    -0.5, 1.0, -3.0, 0.0, 1.0,
    -0.5, 0.0, -3.0, 0.0, 0.0,
    -0.5, 0.0, -2.0, 1.0, 0.0,
    -0.5, 1.0, -3.0, 0.0, 1.0,
    -0.5, 1.0, -2.0, 1.0, 1.0,
    -0.5, 0.0, -2.0, 1.0, 0.0,

    0.5, 1.0, -3.0, 0.0, 1.0,
    0.5, 0.0, -3.0, 0.0, 0.0,
    0.5, 0.0, -2.0, 1.0, 0.0,
    0.5, 1.0, -3.0, 0.0, 1.0,
    0.5, 1.0, -2.0, 1.0, 1.0,
    0.5, 0.0, -2.0, 1.0, 0.0,

    -0.5, 1.0, 3.0, 0.0, 1.0,
    -0.5, 0.0, 3.0, 0.0, 0.0,
    -0.5, 0.0, 2.0, 1.0, 0.0,
    -0.5, 1.0, 3.0, 0.0, 1.0,
    -0.5, 1.0, 2.0, 1.0, 1.0,
    -0.5, 0.0, 2.0, 1.0, 0.0,

    0.5, 1.0, 3.0, 0.0, 1.0,
    0.5, 0.0, 3.0, 0.0, 0.0,
    0.5, 0.0, 2.0, 1.0, 0.0,
    0.5, 1.0, 3.0, 0.0, 1.0,
    0.5, 1.0, 2.0, 1.0, 1.0,
    0.5, 0.0, 2.0, 1.0, 0.0,

    -3.0, 1.0, 0.5, 1.0, 1.0,
    -3.0, 0.0, 0.5, 1.0, 0.0,
    -2.0, 0.0, 0.5, 0.0, 0.0,
    -3.0, 1.0, 0.5, 1.0, 1.0,
    -2.0, 1.0, 0.5, 0.0, 1.0,
    -2.0, 0.0, 0.5, 0.0, 0.0,

    -3.0, 1.0, -0.5, 1.0, 1.0,
    -3.0, 0.0, -0.5, 1.0, 0.0,
    -2.0, 0.0, -0.5, 0.0, 0.0,
    -3.0, 1.0, -0.5, 1.0, 1.0,
    -2.0, 1.0, -0.5, 0.0, 1.0,
    -2.0, 0.0, -0.5, 0.0, 0.0,

    3.0, 1.0, 0.5, 1.0, 1.0,
    3.0, 0.0, 0.5, 1.0, 0.0,
    2.0, 0.0, 0.5, 0.0, 0.0,
    3.0, 1.0, 0.5, 1.0, 1.0,
    2.0, 1.0, 0.5, 0.0, 1.0,
    2.0, 0.0, 0.5, 0.0, 0.0,

    3.0, 1.0, -0.5, 1.0, 1.0,
    3.0, 0.0, -0.5, 1.0, 0.0,
    2.0, 0.0, -0.5, 0.0, 0.0,
    3.0, 1.0, -0.5, 1.0, 1.0,
    2.0, 1.0, -0.5, 0.0, 1.0,
    2.0, 0.0, -0.5, 0.0, 0.0,
]