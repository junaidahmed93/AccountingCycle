var ref = new Firebase("https://accountingcycle.firebaseio.com/");

var app = angular.module('accounting', []);

app.controller('Ctrl1', function ($scope) {
    console.log('Hello Ctrl1');
    $scope.entry = [];
    $scope.done = function (a) {
        console.log($scope.entry);
        timeTaken = $scope.entry.date.toString();
        mm_dd = timeTaken.slice(4, 11);


        try {

            ref.child('General-Journal').child($scope.entry.date.toString()).set({
                Debit: {
                    Title: $scope.entry.debitTitle,
                    Amount: $scope.entry.debitAmount,
                    Date: mm_dd
                },
                Credit: {
                    Title: $scope.entry.creditTitle,
                    Amount: $scope.entry.creditAmount
                }
            });

            ref.child('Ledger-Posting').child($scope.entry.debitTitle).push({
                Debit: {
                    Date: mm_dd,
                    Amount: $scope.entry.debitAmount
                },
                // Credit : {
                //     Date : mm_dd,
                //     Amount :$scope.entry.creditAmount
                // }
            });

            ref.child('Ledger-Posting').child($scope.entry.creditTitle).push({
                // Debit : {
                //     Date : mm_dd,
                //     Amount :$scope.entry.debitAmount
                // },
                Credit: {
                    Date: mm_dd,
                    Amount: $scope.entry.creditAmount
                }
            });

            ref.child('All-Accounts').child($scope.entry.creditTitle).set({
                Date: mm_dd
            });
            ref.child('All-Accounts').child($scope.entry.debitTitle).set({
                Date: mm_dd
            })

        }
        catch (err) {
            console.log(err);
        }


    }
})

app.controller('Ctrl2', function ($scope) {
    $scope.generalJournal = {};
    ref.child('General-Journal').on("value", function (snapshot) {

        $scope.generalJournal = snapshot.val();

        $scope.$digest();
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);

    });
    //$scope.digest();
})

app.controller('Ledger-posting', function ($scope) {
    $scope.ledgerPosting = [];
    $scope.checking = [];
    ref.child("Ledger-Posting").on('value', function (snapshot) {
        $scope.ledgerPosting = snapshot.val();
        console.log(snapshot.val())
        
    var InitialCredit= 0 , InitialDebit=0  ;

        $scope.checking = snapshot.val()
        //console.log( $scope.checking)
        for (var key in $scope.checking) {
            InitialCredit = 0; InitialDebit=0;
           // console.log(key);
            if ($scope.checking.hasOwnProperty(key)) {
               // console.log($scope.checking[key])
                // $scope.newWala.push($scope.checking[key]);
                for (var keyInsider in $scope.checking[key]) {
                   // console.log(keyInsider);
                    if ($scope.checking[key].hasOwnProperty(keyInsider)) {
                       // console.log($scope.checking[key][keyInsider]);
                        if ($scope.checking[key][keyInsider].Debit) {
                           // console.log($scope.checking[key][keyInsider].Debit.Amount);
                            InitialDebit = InitialDebit +  $scope.checking[key][keyInsider].Debit.Amount;
                            $scope.checking[key][keyInsider].Debit.Total=InitialDebit;
                           // console.log(InitialDebit);                            
                            ref.child('Balance').child(key).child('Debit').set({
                                DebitTotal : InitialDebit
                            })
                            //InitialDebit = 0;
                        }
                        if ($scope.checking[key][keyInsider].Credit) {
                           // console.log($scope.checking[key][keyInsider].Credit.Amount);
                            InitialCredit = InitialCredit +  $scope.checking[key][keyInsider].Credit.Amount;
                            $scope.checking[key][keyInsider].Credit.Total=InitialCredit;
                           // console.log(InitialCredit);                            
                           
                           // console.log('Note Name 1' , noteName1);
                            ref.child('Balance').child(key).child('Credit').set({
                                CreditTotal : InitialCredit
                            })
                            //InitialCredit =0;
                        }
                    }
                }
            }


        }

       $scope.$digest();
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


    // $scope.checking = {};
    // $scope.newWala = [];
    // ref.child('Ledger-Posting').on("value", function (snapshot) {

    //     //$scope.ledgerPosting = snapshot.val();
    //     $scope.checking = snapshot.val()
    //     for (var key in $scope.checking) {
    //         console.log(key);
    //         if ($scope.checking.hasOwnProperty(key)) {
    //             console.log($scope.checking[key])
    //             $scope.newWala.push($scope.checking[key]);
    //             for (var keyInsider in $scope.checking[key]) {
    //                 console.log(keyInsider);
    //                 if ($scope.checking[key].hasOwnProperty(keyInsider)) {
    //                     console.log($scope.checking[key][keyInsider]);
    //                     //console.log($scope.checking[key][keyInsider].Credit.Amount);
    //                 }
    //             }
    //         }


    // }

    //     $scope.$digest();
    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);

    // });
})

app.controller('Ctrl3',function($scope){
    
    $scope.Balance = [];
    ref.child('Balance').on('value',function(snapshot){
        console.log(snapshot.val());
        $scope.Balance = snapshot.val();
        
        for(var key in $scope.Balance)
        {
            console.log(key);
            if($scope.Balance.hasOwnProperty(key))
            {    var dTotal=0,cTotal=0;
                for(var key1 in $scope.Balance[key])
                {   
                   
                    if($scope.Balance[key][key1].DebitTotal)
                    {
                        dTotal = $scope.Balance[key][key1].DebitTotal;
                    }
                    if($scope.Balance[key][key1].CreditTotal)
                    {
                        cTotal = $scope.Balance[key][key1].CreditTotal;
                    }
                    if(cTotal)
                    { console.log(cTotal);
                        if(dTotal)
                        { console.log(dTotal);
                            overall = dTotal - cTotal;
                            console.log(overall);
                            if(overall>=0)
                            {
                                $scope.Balance[key][key1].Total = overall;
                            }
                            if(overall<0)
                            {
                                overall= (overall) * (-1);
                                console.log(overall);
                                $scope.Balance[key][key1].Total = overall;
                            }
                        }
                    }
                    
                 
                }
            }
        }
        
        $scope.$digest();
    },function(errorObject){
        console.log("The read failed: " + errorObject.code);
    });
    
    $scope.checkAccount = function(a)
    {  if(a == 'cash')
        {
            return true;
        }
        
    }
});

app.controller('testingController',function($scope){
    
    $scope.test;
    $scope.data = {};
    $scope.func = function(){
        if($scope.test == 1){
            return true;
        }
        
       
    }
 $scope.data.isVisible = true;
});