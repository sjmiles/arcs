load(
    "//third_party/java/arcs/build_defs:build_defs.bzl",
    "arcs_kt_jvm_library",
    "arcs_kt_jvm_test_suite",
)

licenses(["notice"])

package(default_visibility = ["//java/arcs:allowed-packages"])

arcs_kt_jvm_test_suite(
    name = "data",
    srcs = glob(["*Test.kt"]),
    data = ["//java/arcs/core/data/testdata:examples"],
    package = "arcs.core.data",
    deps = [
        "//java/arcs/core/crdt",
        "//java/arcs/core/data",
        "//java/arcs/core/data:schema_fields",
        "//java/arcs/core/data/expression",
        "//java/arcs/core/data/expression:particle",
        "//java/arcs/core/data/util:data-util",
        "//java/arcs/core/storage:storage_key",
        "//java/arcs/core/storage/api",
        "//java/arcs/core/type",
        "//java/arcs/core/util",
        "//third_party/java/arcs/deps:protobuf_java",
        "//third_party/java/junit:junit-android",
        "//third_party/java/truth:truth-android",
        "//third_party/kotlin/kotlin:kotlin_test",
        "//third_party/kotlin/mockito_kotlin",
    ],
)

arcs_kt_jvm_library(
    name = "generators",
    testonly = 1,
    srcs = [
        "Generators.kt",
    ],
    deps = [
        "//java/arcs/core/data",
        "//java/arcs/core/data:schema_fields",
        "//java/arcs/core/entity",
        "//java/arcs/core/host",
        "//java/arcs/core/storage:storage_key",
        "//java/arcs/core/testutil",
        "//java/arcs/core/type",
        "//javatests/arcs/core/host:generators",
    ],
)
