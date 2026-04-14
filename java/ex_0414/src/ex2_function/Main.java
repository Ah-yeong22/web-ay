package ex2_function;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.BiPredicate;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class Main {

    public static void main(String[] args) {

        Consumer<String> consumer = str -> System.out.println("출력 : " + str);

        consumer.accept("안녕하세요");
        consumer.accept("자바");
        
        List<String> fruits = Arrays.asList("사과","바나나","포도");
        
        //과일 1개를 출력하는 람다식 만들기 
        Consumer<String> fruitPrinter = System.out::println;
        
        //리스트에 들어있는 모든 내용을 람다식을 이용해 출력해보기
        for(String fruit : fruits) {
        	fruitPrinter.accept(fruit);
        }
        
        //Supplier<T>
        //값을 만들어서 공급하는 인터페이스
        //입력은 없고, 반환값만 있다. 
        //T get()
        
        Supplier<String> supplier = () -> "안녕하세요";
        System.out.println(supplier.get());
        
        //랜덤 주사위 눈을 반환받는 람다식 만들고 눈 뽑기
        Supplier<Integer> dice = () -> (int)(Math.random()*6) +1;
        System.out.println(dice.get());
        
        //랜덤값 생성
        //기본값 생성
        //객체 생성
        //지연 생성
        
        ExpensiveObject obj = new ExpensiveObject();
        Supplier<ExpensiveObject> supplier2 = () -> new ExpensiveObject();
        
        supplier2.get();
        
        //Function<T,R>
        //입력값을 받아서 다른 결과값으로 변환하는 인터페이스 
        //R apply(T t)
        
        //문자열 길이 구하기 
        Function<String, Integer> lengthFunction = str -> str.length();
        
        System.out.println();lengthFunction.apply("hello");
        System.out.println();lengthFunction.apply("java");
        
        List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);
        List<Integer>result = new ArrayList<Integer>();
        //numbers에 들어있는 모든 요소에 2를 곱하여 result에 넣기 	
        numbers.forEach(n -> result.add(n*2));
        System.out.println(result);
        
        //Predicate<T>
        //값을 받아서 조건을 검사한 뒤 true/false를 반환하는 인터페이스 
        //boolean test(T t);
        
        Predicate<String> isLongText = str -> str.length() >= 5;
        System.out.println(isLongText.test("java"));
        System.out.println(isLongText.test("spring"));
        
        //BiConsumer<T,U>
        //값을 두개 받아서 소비만 한다. 
        //void accept(T t, U u);
        
        BiConsumer<String, Integer> printUser =
        		(name, age) -> System.out.println("이름 : " + name +", "+ "나이 " + age);
        printUser.accept("김철수",25);
        
        //BiPredicate<T,U>
        //값을 두개 받아서 조건 검사 후 t/f 반환
        //boolean test(T t, U u)
        BiPredicate<String,String> isSame = 
        		(a,b) -> a.equals(b);
        		
        		System.out.println(isSame.test("java", "java"));
        		System.out.println(isSame.test("java", "Spring"));
        
    }
}