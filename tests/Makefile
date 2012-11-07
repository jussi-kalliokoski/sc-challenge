TESTS ?= $(wildcard */index.rb)

all: tests

tests:
	@echo $(TESTS)
	@for i in $(TESTS); do echo "Running test $$i..."; ruby $$i; done

.PHONY: all tests
