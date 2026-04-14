package ex2_function;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

public class MemberMain {

    public static void main(String[] args) {

        // 리스트 생성
        List<Member> list = Arrays.asList(
            new Member("김철수", 25),
            new Member("이영희", 18),
            new Member("박민수", 30),
            new Member("최지은", 15)
        );

        
        Predicate<Member> adult = m -> m.age >= 20;

        for(Member m : list) {
            if(adult.test(m)) {
                System.out.println(m.name + " / " + m.age);
            }
        }
    }
}