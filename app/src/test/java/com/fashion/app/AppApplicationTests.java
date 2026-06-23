package com.fashion.app;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disabled because it requires a running MySQL database")
class AppApplicationTests {

    @Test
    void contextLoads() {
    }

}
